/**
 * A host for solving crosswords together: players connect to it (e.g. over
 * WebSockets) and it passes their messages on to the other players in the
 * same room, keeping each room's grid so players joining later start from the
 * same place.
 *
 * It has no dependencies and doesn't run a server itself, so it can be used
 * with any WebSocket server (e.g. `ws` on Node.js, Bun, Deno or Cloudflare
 * Durable Objects): pass each connection to `connect` along with its room.
 */
// a `.js` extension (resolved to `types.ts`) as the dev server's config
// imports this file, and it's kept in the published declarations
import type {
  CellPosition,
  GuessGrid,
  MultiplayerCellChange,
  MultiplayerMessage,
} from './types.js';

export type { MultiplayerMessage } from './types.js';

/** A player's connection to the host, e.g. a WebSocket. */
export interface MultiplayerHostClient {
  /** Sends a message (as text) to the player. */
  send: (data: string) => void;
}

/** The functions to call when a player sends a message or disconnects. */
export interface MultiplayerHostConnection {
  /** Call with each (text) message received from the player. */
  receive: (data: string) => void;
  /** Call when the player disconnects. */
  close: () => void;
}

export interface MultiplayerHostOptions {
  /** The most columns (or rows) a grid can have. Defaults to 100. */
  maxGridSize?: number;
}

export interface MultiplayerHost {
  /**
   * Adds a player to a room. The room is created when its first player
   * connects and is removed (with its grid) when its last player leaves.
   */
  connect: (
    client: MultiplayerHostClient,
    roomId: string,
  ) => MultiplayerHostConnection;
  /** The room's grid, or `null` if it doesn't have one (yet). */
  getGrid: (roomId: string) => GuessGrid | null;
  /** The ids of the rooms that have players. */
  getRoomIds: () => string[];
}

type Room = {
  /** Changes made before the room had a grid, to apply when it gets one. */
  changesBeforeGrid: MultiplayerCellChange[];
  grid: GuessGrid | null;
  /** The players' clients and their ids (`null` until they join). */
  players: Map<MultiplayerHostClient, string | null>;
};

const MAX_ID_LENGTH = 100;
const MAX_CHANGES_BEFORE_GRID = 10000;
const GUESS_PATTERN = /^[A-Z0-9]?$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isId(value: unknown): value is string {
  return (
    typeof value === 'string' && value !== '' && value.length <= MAX_ID_LENGTH
  );
}

function isIndex(value: unknown, max: number): value is number {
  return (
    Number.isInteger(value) && (value as number) >= 0 && (value as number) < max
  );
}

function parsePos(value: unknown, cols: number, rows: number) {
  if (
    !isRecord(value) ||
    !isIndex(value.col, cols) ||
    !isIndex(value.row, rows)
  ) {
    return null;
  }

  return { col: value.col, row: value.row } as CellPosition;
}

function parseGrid(value: unknown, maxGridSize: number): GuessGrid | null {
  if (!isRecord(value) || !Array.isArray(value.value)) {
    return null;
  }

  const columns: unknown[] = value.value;
  const rows = Array.isArray(columns[0]) ? columns[0].length : 0;

  if (
    columns.length === 0 ||
    columns.length > maxGridSize ||
    rows === 0 ||
    rows > maxGridSize
  ) {
    return null;
  }

  const valid = columns.every(
    (column) =>
      Array.isArray(column) &&
      column.length === rows &&
      column.every(
        (guess) => typeof guess === 'string' && GUESS_PATTERN.test(guess),
      ),
  );

  return valid ? (value as GuessGrid) : null;
}

function parseChanges(
  value: unknown,
  cols: number,
  rows: number,
): MultiplayerCellChange[] | null {
  if (!Array.isArray(value) || value.length > cols * rows) {
    return null;
  }

  const changes: MultiplayerCellChange[] = [];

  for (const change of value) {
    const pos = isRecord(change) ? parsePos(change.pos, cols, rows) : null;

    if (
      pos === null ||
      typeof change.guess !== 'string' ||
      !GUESS_PATTERN.test(change.guess)
    ) {
      return null;
    }

    changes.push({ pos, guess: change.guess } as MultiplayerCellChange);
  }

  return changes;
}

function applyChanges(grid: GuessGrid, changes: MultiplayerCellChange[]) {
  changes.forEach(({ pos, guess }) => {
    const column = grid.value[pos.col];

    if (column !== undefined && pos.row < column.length) {
      column[pos.row] = guess;
    }
  });
}

/**
 * Creates a host for solving crosswords together. See the README for the
 * messages sent between the players and the host.
 *
 * @example
 * ```ts
 * import { WebSocketServer } from 'ws';
 * import { createMultiplayerHost } from 'mycrossword/host';
 *
 * const host = createMultiplayerHost();
 * const server = new WebSocketServer({ port: 8080 });
 *
 * server.on('connection', (socket, request) => {
 *   const url = new URL(request.url ?? '', 'http://localhost');
 *   const connection = host.connect(socket, url.searchParams.get('room') ?? '');
 *
 *   socket.on('message', (data) => connection.receive(data.toString()));
 *   socket.on('close', () => connection.close());
 *   // without a listener, an error (e.g. a malformed message) would crash
 *   // the server. The socket is closed after an error.
 *   socket.on('error', (error) => console.warn(error));
 * });
 * ```
 */
export function createMultiplayerHost({
  maxGridSize = 100,
}: MultiplayerHostOptions = {}): MultiplayerHost {
  const rooms = new Map<string, Room>();

  const send = (client: MultiplayerHostClient, message: MultiplayerMessage) => {
    try {
      client.send(JSON.stringify(message));
    } catch {
      // the client has disconnected, and will be removed when it closes
    }
  };

  /** Sends a message to the players in the room that have joined. */
  const broadcast = (
    room: Room,
    message: MultiplayerMessage,
    except?: MultiplayerHostClient,
  ) => {
    room.players.forEach((playerId, client) => {
      if (playerId !== null && client !== except) {
        send(client, message);
      }
    });
  };

  const receive = (room: Room, client: MultiplayerHostClient, data: string) => {
    let message: unknown;

    try {
      message = JSON.parse(data);
    } catch {
      return;
    }

    if (!isRecord(message)) {
      return;
    }

    if (message.type === 'join') {
      if (!isId(message.playerId)) {
        return;
      }

      // ids must be unique within a room, as players recognise their own
      // changes (sent back by the host) by their id
      const idTaken = Array.from(room.players).some(
        ([other, playerId]) => other !== client && playerId === message.playerId,
      );

      if (idTaken) {
        return;
      }

      const previousId = room.players.get(client);

      // rejoining with a new id replaces the old one (rejoining with the same
      // id, e.g. to get the grid again, doesn't)
      if (
        previousId !== null &&
        previousId !== undefined &&
        previousId !== message.playerId
      ) {
        broadcast(room, { type: 'leave', playerId: previousId }, client);
      }

      room.players.set(client, message.playerId);
      send(client, { type: 'sync', grid: room.grid });
      broadcast(room, { type: 'join', playerId: message.playerId }, client);
      return;
    }

    // the other messages are only accepted once the player has joined, and
    // are sent on with the id it joined with
    const playerId = room.players.get(client);

    if (playerId === null || playerId === undefined) {
      return;
    }

    const cols = room.grid?.value.length ?? maxGridSize;
    const rows = room.grid?.value[0].length ?? maxGridSize;

    switch (message.type) {
      case 'sync': {
        const grid = parseGrid(message.grid, maxGridSize);

        if (grid === null) {
          return;
        }

        if (room.grid === null) {
          // the first grid sent starts the room off
          room.grid = grid;
          applyChanges(room.grid, room.changesBeforeGrid);
          room.changesBeforeGrid = [];
          broadcast(room, { type: 'sync', grid: room.grid }, client);
        } else {
          // another player started the room off first
          send(client, { type: 'sync', grid: room.grid });
        }
        return;
      }

      case 'cells': {
        const changes = parseChanges(message.changes, cols, rows);

        if (changes === null) {
          return;
        }

        if (room.grid !== null) {
          applyChanges(room.grid, changes);
        } else {
          room.changesBeforeGrid.push(...changes);
          room.changesBeforeGrid.splice(
            0,
            room.changesBeforeGrid.length - MAX_CHANGES_BEFORE_GRID,
          );
        }

        // sent back to the sender too, so it knows the order the host
        // received the changes in
        broadcast(room, { type: 'cells', playerId, changes });
        return;
      }

      case 'focus': {
        const pos = parsePos(message.pos, cols, rows);

        if (pos !== null && isId(message.clueId)) {
          broadcast(
            room,
            { type: 'focus', playerId, pos, clueId: message.clueId },
            client,
          );
        }
        return;
      }

      case 'leave': {
        room.players.set(client, null);
        broadcast(room, { type: 'leave', playerId }, client);
        return;
      }
    }
  };

  const close = (roomId: string, room: Room, client: MultiplayerHostClient) => {
    const playerId = room.players.get(client);

    if (playerId === undefined) {
      return;
    }

    room.players.delete(client);

    if (playerId !== null) {
      broadcast(room, { type: 'leave', playerId });
    }

    if (room.players.size === 0 && rooms.get(roomId) === room) {
      rooms.delete(roomId);
    }
  };

  return {
    connect: (client, roomId) => {
      let room = rooms.get(roomId);

      if (room === undefined) {
        room = { changesBeforeGrid: [], grid: null, players: new Map() };
        rooms.set(roomId, room);
      }

      const joinedRoom = room;
      joinedRoom.players.set(client, null);

      return {
        receive: (data) => receive(joinedRoom, client, data),
        close: () => close(roomId, joinedRoom, client),
      };
    },
    getGrid: (roomId) => rooms.get(roomId)?.grid ?? null,
    getRoomIds: () => Array.from(rooms.keys()),
  };
}
