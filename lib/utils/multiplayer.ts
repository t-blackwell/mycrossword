import type {
  CellPosition,
  Char,
  MultiplayerCellChange,
  MultiplayerMessage,
} from '~/types';
import { isValidChar } from './general';
import { validateGuessGrid } from './guess';

/** The longest player or clue id accepted in a message. */
const MAX_ID_LENGTH = 100;

/** Colours for other players' selections, chosen by their id. */
export const PLAYER_COLOURS = [
  '#e53935',
  '#8e24aa',
  '#00897b',
  '#f4511e',
  '#3949ab',
  '#7cb342',
  '#d81b60',
  '#6d4c41',
] as const;

/** Picks a colour for a player, which is the same for every player. */
export function getPlayerColour(playerId: string) {
  let hash = 0;

  for (let i = 0; i < playerId.length; i += 1) {
    hash = (hash * 31 + playerId.charCodeAt(i)) | 0;
  }

  return PLAYER_COLOURS[Math.abs(hash) % PLAYER_COLOURS.length];
}

/** Creates a random id for a player. */
export function createPlayerId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID !== undefined) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isId(value: unknown): value is string {
  return (
    typeof value === 'string' && value !== '' && value.length <= MAX_ID_LENGTH
  );
}

function parsePos(
  value: unknown,
  cols: number,
  rows: number,
): CellPosition | null {
  if (!isRecord(value)) {
    return null;
  }

  const { col, row } = value;

  if (
    !Number.isInteger(col) ||
    !Number.isInteger(row) ||
    (col as number) < 0 ||
    (row as number) < 0 ||
    (col as number) >= cols ||
    (row as number) >= rows
  ) {
    return null;
  }

  return { col: col as number, row: row as number };
}

function parseChanges(
  value: unknown,
  cols: number,
  rows: number,
  cellMatcher: RegExp,
): MultiplayerCellChange[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const changes: MultiplayerCellChange[] = [];

  for (const change of value) {
    if (!isRecord(change)) {
      return null;
    }

    const pos = parsePos(change.pos, cols, rows);
    const { guess } = change;

    if (
      pos === null ||
      typeof guess !== 'string' ||
      (guess !== '' && !isValidChar(guess, cellMatcher))
    ) {
      return null;
    }

    changes.push({ pos, guess: guess as Char });
  }

  return changes;
}

/**
 * Checks a message received from the host, as it can't be trusted. Returns
 * the message, or `null` if it's invalid or of an unknown type (to be
 * ignored).
 */
export function parseMultiplayerMessage(
  message: unknown,
  cols: number,
  rows: number,
  cellMatcher: RegExp,
): MultiplayerMessage | null {
  if (!isRecord(message)) {
    return null;
  }

  switch (message.type) {
    case 'join':
    case 'leave':
      return isId(message.playerId)
        ? { type: message.type, playerId: message.playerId }
        : null;

    case 'sync': {
      if (message.grid === null) {
        return { type: 'sync', grid: null };
      }

      return isRecord(message.grid) &&
        validateGuessGrid(
          { value: message.grid.value as Char[][] },
          cols,
          rows,
          cellMatcher,
        )
        ? { type: 'sync', grid: { value: message.grid.value as Char[][] } }
        : null;
    }

    case 'cells': {
      const changes = parseChanges(message.changes, cols, rows, cellMatcher);

      return isId(message.playerId) && changes !== null
        ? { type: 'cells', playerId: message.playerId, changes }
        : null;
    }

    case 'focus': {
      const pos = parsePos(message.pos, cols, rows);

      return isId(message.playerId) && pos !== null && isId(message.clueId)
        ? {
            type: 'focus',
            playerId: message.playerId,
            pos,
            clueId: message.clueId,
          }
        : null;
    }

    default:
      return null;
  }
}
