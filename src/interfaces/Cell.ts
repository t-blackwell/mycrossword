import { CellPosition, Char } from '.';

export default interface Cell {
  clueIds: string[];
  groupAcross?: string[];
  groupDown?: string[];
  guess?: Char;
  num?: number;
  pos: CellPosition;
  selected: boolean;
  val: Char;
}
