import { create } from 'zustand';
import type { Cell, CellPosition } from '~/types';

type CellsStore = {
  cells: Cell[];
  setCells: (cells: Cell[]) => void;
  select: (pos: CellPosition) => void;
  answerAll: (answered: boolean) => void;
};

export const useCellsStore = create<CellsStore>((set) => ({
  cells: [],
  setCells: (cells) => {
    set(() => ({ cells }));
  },
  select: (pos) => {
    set((state) => {
      return {
        cells: state.cells.map((cell) => ({
          ...cell,
          selected: cell.pos.col === pos.col && cell.pos.row === pos.row,
        })),
      };
    });
  },
  answerAll: (answered) => {
    set((state) => {
      return {
        cells: state.cells.map((cell) => ({
          ...cell,
          guess: answered ? cell.val : undefined,
        })),
      };
    });
  },
}));
