/* eslint-disable import/no-cycle */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Clue } from 'interfaces';
import { RootState } from './store';

export interface CluesState {
  clues: Clue[];
}

const initialState: CluesState = {
  clues: [],
};

export const cluesSlice = createSlice({
  name: 'clues',
  initialState,
  reducers: {
    select: (state, action: PayloadAction<string>) => {
      state.clues = state.clues.map((clue) => ({
        ...clue,
        selected: clue.id === action.payload,
      }));
    },
    updateAll: (state, action: PayloadAction<Clue[]>) => {
      state.clues = action.payload;
    },
  },
});

export const { select, updateAll } = cluesSlice.actions;

export const getClues = (state: RootState) => state.clues.clues;

export default cluesSlice.reducer;
