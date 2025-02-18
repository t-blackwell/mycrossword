import { create } from 'zustand';
import type { Cell, CellPosition } from '~/types';

type CellsStore = {
  cells: Cell[];
  complete: boolean;
  checkComplete: () => boolean | null;
  setCells: (cells: Cell[]) => void;
  select: (pos: CellPosition) => void;
  answerAll: (answered: boolean) => void;
};

export const useCellsStore = create<CellsStore>((set, get) => ({
  cells: [],
  complete: false,
  checkComplete: () => {
    if (get().complete) {
      return null; // don't trigger multiple times
    }

    const isComplete = get().cells.every((cell) => cell.val === cell.guess);
    set({ complete: isComplete });
    return isComplete;
  },
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
