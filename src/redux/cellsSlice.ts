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

export const cellsSlice = createSlice({
  name: 'cells',
  initialState,
  reducers: {
    clearGrid: (state) => {
      state.cells = state.cells.map((cell) => ({
        ...cell,
        guess: undefined,
      }));
    },
    revealGrid: (state) => {
      state.cells = state.cells.map((cell) => ({
        ...cell,
        guess: cell.val,
      }));
    },
    select: (state, action: PayloadAction<CellPosition>) => {
      state.cells = state.cells.map((cell) => ({
        ...cell,
        selected:
          cell.pos.col === action.payload.col &&
          cell.pos.row === action.payload.row,
      }));
    },
    updateGrid: (state, action: PayloadAction<Cell[]>) => {
      state.cells = action.payload;
    },
  },
});

export const { clearGrid, revealGrid, select, updateGrid } = cellsSlice.actions;

export const getCells = (state: RootState) => state.cells.cells;

export default cellsSlice.reducer;
