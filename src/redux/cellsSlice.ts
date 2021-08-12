/* eslint-disable import/no-cycle */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cell, CellPosition } from 'interfaces';
import { RootState } from './store';

export interface CellsState {
  cells: Cell[];
}

const initialState: CellsState = {
  cells: [],
};

const findByPos = (cells: Cell[], cellPos: CellPosition) =>
  cells.find(
    (cell) => cell.pos.col === cellPos.col && cell.pos.row === cellPos.row,
  );

const blankNeighbours = (cells: Cell[], currentCell: Cell, across: boolean) => {
  const cellOne = findByPos(cells, {
    col: currentCell.pos.col - (across ? 0 : 1),
    row: currentCell.pos.row - (across ? 1 : 0),
  });

  const cellTwo = findByPos(cells, {
    col: currentCell.pos.col + (across ? 0 : 1),
    row: currentCell.pos.row + (across ? 1 : 0),
  });

  return cellOne?.guess === undefined && cellTwo?.guess === undefined;
};

export const cellsSlice = createSlice({
  name: 'cells',
  initialState,
  reducers: {
    check: (state, action: PayloadAction<string[]>) => {
      state.cells = state.cells.map((cell) => {
        const intersection = action.payload.filter((clueId) =>
          cell.clueIds.includes(clueId),
        );

        if (intersection.length > 0) {
          return {
            ...cell,
            guess: cell.guess === cell.val ? cell.val : undefined,
          };
        }

        return cell;
      });
    },
    clear: (state, action: PayloadAction<string[]>) => {
      state.cells = state.cells.map((cell) => {
        const intersection = action.payload.filter((clueId) =>
          cell.clueIds.includes(clueId),
        );

        if (intersection.length > 0) {
          if (cell.clueIds.length === 1) {
            // only one direction, can safely clear the cell
            return {
              ...cell,
              guess: undefined,
            };
            // eslint-disable-next-line no-else-return
          } else {
            // more than one direction, check if neighbouring letters are blank
            const clueId = intersection[0];
            const across = clueId.includes('across');
            if (blankNeighbours(state.cells, cell, across)) {
              return {
                ...cell,
                guess: undefined,
              };
            }
          }
        }

        return cell;
      });
    },
    reveal: (state, action: PayloadAction<string[]>) => {
      state.cells = state.cells.map((cell) => {
        const intersection = action.payload.filter((clueId) =>
          cell.clueIds.includes(clueId),
        );

        if (intersection.length > 0) {
          return {
            ...cell,
            guess: cell.val,
          };
        }

        return cell;
      });
    },
    select: (state, action: PayloadAction<CellPosition>) => {
      state.cells = state.cells.map((cell) => ({
        ...cell,
        selected:
          cell.pos.col === action.payload.col &&
          cell.pos.row === action.payload.row,
      }));
    },
    update: (state, action: PayloadAction<Cell>) => {
      state.cells = state.cells.map((cell) => {
        if (
          cell.pos.col === action.payload.pos.col &&
          cell.pos.row === action.payload.pos.row
        ) {
          return action.payload;
        }
        return cell;
      });
    },
    updateAll: (state, action: PayloadAction<Cell[]>) => {
      state.cells = action.payload;
    },
  },
});

export const { check, clear, reveal, select, update, updateAll } =
  cellsSlice.actions;

export const getCells = (state: RootState) => state.cells.cells;

export default cellsSlice.reducer;
