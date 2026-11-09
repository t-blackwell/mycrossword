export type SeparatorLocations = { [key in ',' | '-']: number[] };
export type SeparatorLocationsOptional = { [key in ',' | '-']?: number[] };

export type Direction = 'across' | 'down';

export type GuardianClue = {
  clue: string;
  direction: Direction;
  group: string[];
  humanNumber: string;
  id: string;
  length: number;
  number: number;
  position: { x: number; y: number };
  separatorLocations: SeparatorLocationsOptional;
  solution?: string;
};

export type Clue = GuardianClue & {
  answered: boolean;
  selected: boolean;
};

export type GuardianCrossword = {
  creator?: {
    name: string;
    webUrl: string;
  };
  crosswordType:
    | 'cryptic'
    | 'quick'
    | 'quiptic'
    | 'speedy'
    | 'prize'
    | 'everyman';
  date: number;
  dateSolutionAvailable?: number;
  dimensions: {
    cols: number;
    rows: number;
  };
  entries: GuardianClue[];
  id: string;
  name: string;
  number: number;
  pdf?: string;
  solutionAvailable: boolean;
  webPublicationDate?: number;
};

export type Char =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '';

export type Cell = {
  checked?: boolean;
  clueIds: string[];
  guess?: Char;
  num?: number;
  pos: CellPosition;
  selected: boolean;
  val: Char;
};

export type CellPosition = {
  col: number;
  row: number;
};

export type CellChange = {
  pos: CellPosition;
  guess?: Char;
  previousGuess?: Char;
};

export type CellFocus = {
  pos: CellPosition;
  clueId: string;
};

export type GuessGrid = {
  value: Char[][];
};

/**
 * A change to a cell's guess sent between players. A cleared cell has a
 * `guess` of `''`.
 */
export type MultiplayerCellChange = {
  pos: CellPosition;
  guess: Char;
};

/**
 * The messages sent between the players and the host when solving together.
 *
 * - `join`: sent by a player when it connects. The host replies with `sync`
 *   and passes it on to the other players (who reply with `focus`).
 * - `sync`: the whole grid, sent by the host to a player that joins (`null`
 *   if the host doesn't have the grid yet). A player sent `null` replies with
 *   its own grid to start the room off.
 * - `cells`: guesses a player has changed. The host passes it on to every
 *   player, including the sender, in the order received.
 * - `focus`: the cell (and clue) a player has selected.
 * - `leave`: sent when a player stops solving, or by the host when a player
 *   disconnects.
 */
export type MultiplayerMessage =
  | { type: 'join'; playerId: string }
  | { type: 'leave'; playerId: string }
  | { type: 'sync'; grid: GuessGrid | null }
  | { type: 'cells'; playerId: string; changes: MultiplayerCellChange[] }
  | {
      type: 'focus';
      playerId: string;
      pos: CellPosition;
      clueId: string;
    };

/**
 * A connection to the host (or other players) when solving together. It
 * isn't tied to WebSockets: `createWebSocketConnection` creates one for a
 * WebSocket, but any transport that delivers messages in order can be used.
 */
export interface MultiplayerConnection {
  /**
   * Identifies this player. Generated if not given. It must be unique to
   * the connection, as a player recognises its own changes by its id.
   */
  playerId?: string;
  /** Sends a message to the host. */
  send: (message: MultiplayerMessage) => void;
  /**
   * Calls the listener with each message received from the host, until the
   * returned function is called. Messages are checked before they're used,
   * so they needn't be validated first.
   */
  subscribe: (listener: (message: unknown) => void) => () => void;
}

/** Another player solving the crossword. */
export type RemotePlayer = {
  clueId: string;
  colour: string;
  playerId: string;
  pos: CellPosition;
};
