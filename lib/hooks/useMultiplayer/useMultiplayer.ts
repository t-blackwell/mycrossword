import * as React from 'react';
import type {
  Cell,
  CellChange,
  CellPosition,
  Char,
  GuessGrid,
  MultiplayerCellChange,
  MultiplayerConnection,
  RemotePlayer,
} from '~/types';
import { useCrosswordStores } from '~/stores/stores';
import { useEventCallback } from '~/hooks/useEventCallback/useEventCallback';
import { getCellKey } from '~/utils/cell';
import { isCluePopulated } from '~/utils/clue';
import { getGuessGrid } from '~/utils/guess';
import {
  createPlayerId,
  getPlayerColour,
  parseMultiplayerMessage,
} from '~/utils/multiplayer';

/** How long to wait after other players' changes before saving the grid. */
export const REMOTE_SAVE_DELAY = 1000;

/** The state of a connection while the crossword is subscribed to it. */
type Session = {
  connection: MultiplayerConnection;
  /** The key of the last selection sent, so it's only sent when changed. */
  lastFocusKey: string | null;
  /** Changes waiting to be sent (they're sent together). */
  outgoing: MultiplayerCellChange[];
  /**
   * The number of this player's changes to each cell that the host hasn't
   * yet sent back. Other players' changes to these cells are ignored, as
   * the host received them first, so this player's change wins.
   */
  pending: Map<string, number>;
  playerId: string;
  scheduled: { cells: boolean; focus: boolean };
};

/** Sends the changes waiting to be sent. */
function sendCells(session: Session) {
  session.scheduled.cells = false;

  if (session.outgoing.length > 0) {
    session.connection.send({
      type: 'cells',
      playerId: session.playerId,
      changes: session.outgoing,
    });
    session.outgoing = [];
  }
}

interface UseMultiplayerOptions {
  cellMatcher: RegExp;
  cols: number;
  connection?: MultiplayerConnection;
  onComplete?: () => void;
  rows: number;
  saveGuessGrid: (value: GuessGrid) => void;
}

/**
 * Keeps the crossword in step with other players over a connection to a
 * host: this player's changes and selected cell are sent, and other players'
 * changes are applied (without being sent back). Returns the other players
 * and a function to call with each change this player makes.
 */
export function useMultiplayer({
  cellMatcher,
  cols,
  connection,
  onComplete,
  rows,
  saveGuessGrid,
}: UseMultiplayerOptions) {
  const stores = useCrosswordStores();
  const [remotePlayers, setRemotePlayers] = React.useState<RemotePlayer[]>([]);
  const sessionRef = React.useRef<Session | null>(null);
  const generatedPlayerIdRef = React.useRef<string | null>(null);
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const getLocalGuessGrid = useEventCallback(() =>
    getGuessGrid(cols, rows, stores.cells.getState().cells),
  );

  const saveLatest = useEventCallback(() => {
    saveTimeoutRef.current = null;
    saveGuessGrid(getLocalGuessGrid());
  });

  // other players' changes are saved after a pause (like typing), as there
  // may be many of them and saveGrid could e.g. make a request
  const scheduleSave = () => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(saveLatest, REMOTE_SAVE_DELAY);
  };

  // save any changes still waiting when unmounting
  React.useEffect(
    () => () => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
        saveLatest();
      }
    },
    [saveLatest],
  );

  /** Applies other players' guesses, keyed by cell. */
  const applyGuesses = (session: Session, guesses: Map<string, Char>) => {
    const { cells } = stores.cells.getState();
    const changedCells: Cell[] = [];
    let guessAdded = false;

    const updatedCells = cells.map((cell) => {
      const key = getCellKey(cell.pos);
      const guess = guesses.get(key);

      // this player's change to the cell is still to reach the host
      if (guess === undefined || session.pending.has(key)) {
        return cell;
      }

      const newGuess = guess === '' ? undefined : guess;

      if ((cell.guess || undefined) === newGuess) {
        return cell;
      }

      const updatedCell = { ...cell, guess: newGuess };
      changedCells.push(updatedCell);
      guessAdded ||= newGuess !== undefined;

      return updatedCell;
    });

    if (changedCells.length === 0) {
      return;
    }

    // unchecks the changed cells
    stores.cells.getState().setCells(updatedCells);

    // update whether the changed cells' clues are answered
    const { clues, answerSome } = stores.clues.getState();
    const clueIds = new Set(changedCells.flatMap((cell) => cell.clueIds));

    clues.forEach((clue) => {
      if (clueIds.has(clue.id)) {
        answerSome(clue.group, isCluePopulated(clue, updatedCells));
      }
    });

    scheduleSave();

    if (
      guessAdded &&
      onComplete !== undefined &&
      stores.cells.getState().checkComplete() === true
    ) {
      onComplete();
    }
  };

  const sendFocus = (session: Session) => {
    session.scheduled.focus = false;

    const cell = stores.cells.getState().cells.find((c) => c.selected);
    const clue = stores.clues.getState().clues.find((c) => c.selected);

    if (cell === undefined || clue === undefined) {
      return;
    }

    const key = `${getCellKey(cell.pos)}|${clue.id}`;

    if (key !== session.lastFocusKey) {
      session.lastFocusKey = key;
      session.connection.send({
        type: 'focus',
        playerId: session.playerId,
        pos: cell.pos,
        clueId: clue.id,
      });
    }
  };

  // the cell and clue are selected separately, so the selection is sent
  // once both have changed
  const scheduleFocus = (session: Session) => {
    if (!session.scheduled.focus) {
      session.scheduled.focus = true;
      queueMicrotask(() => {
        if (sessionRef.current === session) {
          sendFocus(session);
        }
      });
    }
  };

  const updateRemotePlayer = (
    playerId: string,
    focus: { pos: CellPosition; clueId: string } | null,
  ) => {
    setRemotePlayers((players) => {
      const others = players.filter((player) => player.playerId !== playerId);

      if (focus === null) {
        return others.length === players.length ? players : others;
      }

      return [
        ...others,
        { ...focus, playerId, colour: getPlayerColour(playerId) },
      ];
    });
  };

  const handleMessage = useEventCallback((session: Session, data: unknown) => {
    if (sessionRef.current !== session) {
      return;
    }

    const message = parseMultiplayerMessage(data, cols, rows, cellMatcher);

    if (message === null) {
      return;
    }

    const isOwn =
      'playerId' in message && message.playerId === session.playerId;

    switch (message.type) {
      case 'sync': {
        if (message.grid === null) {
          // the host doesn't have the grid yet, so start it off with ours
          session.connection.send({ type: 'sync', grid: getLocalGuessGrid() });
        } else {
          const grid = message.grid.value;
          const guesses = new Map<string, Char>();

          stores.cells.getState().cells.forEach(({ pos }) => {
            guesses.set(getCellKey(pos), grid[pos.col][pos.row]);
          });

          applyGuesses(session, guesses);
        }
        break;
      }
      case 'cells': {
        if (isOwn) {
          // the host has sent this player's changes back
          message.changes.forEach(({ pos }) => {
            const key = getCellKey(pos);
            const count = (session.pending.get(key) ?? 0) - 1;

            if (count > 0) {
              session.pending.set(key, count);
            } else {
              session.pending.delete(key);
            }
          });
        } else {
          applyGuesses(
            session,
            new Map(
              message.changes.map(({ pos, guess }) => [getCellKey(pos), guess]),
            ),
          );
        }
        break;
      }
      case 'focus': {
        if (!isOwn) {
          updateRemotePlayer(message.playerId, message);
        }
        break;
      }
      case 'join': {
        // let the new player know where this player is
        if (!isOwn) {
          session.lastFocusKey = null;
          scheduleFocus(session);
        }
        break;
      }
      case 'leave': {
        if (!isOwn) {
          updateRemotePlayer(message.playerId, null);
        }
        break;
      }
    }
  });

  React.useEffect(() => {
    if (connection === undefined) {
      return;
    }

    generatedPlayerIdRef.current ??= createPlayerId();

    const session: Session = {
      connection,
      lastFocusKey: null,
      outgoing: [],
      pending: new Map(),
      playerId: connection.playerId ?? generatedPlayerIdRef.current,
      scheduled: { cells: false, focus: false },
    };

    sessionRef.current = session;

    const unsubscribe = connection.subscribe((data) =>
      handleMessage(session, data),
    );
    const handleSelection = () => scheduleFocus(session);
    const unsubscribeCells = stores.cells.subscribe(handleSelection);
    const unsubscribeClues = stores.clues.subscribe(handleSelection);

    connection.send({ type: 'join', playerId: session.playerId });
    sendFocus(session);

    return () => {
      unsubscribe();
      unsubscribeCells();
      unsubscribeClues();
      sendCells(session);
      connection.send({ type: 'leave', playerId: session.playerId });
      sessionRef.current = null;
      setRemotePlayers([]);
    };
    // scheduleFocus and sendFocus only use the stores and the session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, stores, handleMessage]);

  /** Sends a change this player has made to the grid. */
  const sendCellChange = React.useCallback((change: CellChange) => {
    const session = sessionRef.current;

    if (session === null) {
      return;
    }

    const key = getCellKey(change.pos);
    session.pending.set(key, (session.pending.get(key) ?? 0) + 1);
    session.outgoing.push({ pos: change.pos, guess: change.guess ?? '' });

    // changes made together (e.g. revealing a word) are sent together
    if (!session.scheduled.cells) {
      session.scheduled.cells = true;
      queueMicrotask(() => sendCells(session));
    }
  }, []);

  return {
    remotePlayers,
    sendCellChange: connection !== undefined ? sendCellChange : undefined,
  };
}
