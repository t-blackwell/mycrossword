import type { CellPosition, Char } from 'interfaces';

export default interface CellChange {
  pos: CellPosition;
  guess?: Char;
  previousGuess?: Char;
}
