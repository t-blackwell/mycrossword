export default interface GuardianClue {
  clue: string;
  direction: 'across' | 'down';
  group: string[];
  humanNumber: string;
  id: string;
  length: number;
  number: number;
  position: { x: number; y: number };
  separatorLocations: { [key in ',' | '-']?: number[] };
  solution?: string;
}
