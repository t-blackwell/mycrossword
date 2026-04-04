import { create } from 'zustand';
import type { Cell, CellPosition } from '~/types';

type CellsStore = {
  cells: Cell[];
  complete: boolean;
  checkComplete: () => boolean | null;
  resetComplete: () => void;
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
  resetComplete: () => {
    set({ complete: false });
  },
  setCells: (cells) => {
    set((state) => ({
      cells: cells.map((cell, i) => {
        const prev = state.cells[i];

        // If guess changed, uncheck
        if (prev && prev.guess !== cell.guess) {
          return { ...cell, checked: false };
        }

        return cell;
      }),
    }));
  },
  select: (pos) => {
    set((state) => {
      const currentSelected = state.cells.find((cell) => cell.selected);
      const selectedHasChanged =
        currentSelected === undefined ||
        currentSelected.pos.col !== pos.col ||
        currentSelected.pos.row !== pos.row;

      return {
        cells: state.cells.map((cell) => {
          const isCorrect = cell.val === cell.guess;

          return {
            ...cell,
            selected: cell.pos.col === pos.col && cell.pos.row === pos.row,
            checked: selectedHasChanged && isCorrect ? false : cell.checked,
          };
        }),
      };
    });
  },
  answerAll: (answered) => {
    set((state) => {
      return {
        cells: state.cells.map((cell) => ({
          ...cell,
          guess: answered ? cell.val : undefined,
          checked: false,
        })),
      };
    });
  },
}));
