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
