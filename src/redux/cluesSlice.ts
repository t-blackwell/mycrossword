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
    answerGrid: (state) => {
      state.clues = state.clues.map((clue) => ({
        ...clue,
        answered: true,
      }));
    },
    answerOne: (state, action: PayloadAction<string[]>) => {
      state.clues = state.clues.map((clue) => {
        if (action.payload.includes(clue.id)) {
          return {
            ...clue,
            answered: true,
          };
        }

        return clue;
      });
    },
    select: (state, action: PayloadAction<string>) => {
      // append clue to URL e.g. #1-across
      window.location.hash = action.payload;

      state.clues = state.clues.map((clue) => ({
        ...clue,
        selected: clue.id === action.payload,
      }));
    },
    unanswerGrid: (state) => {
      state.clues = state.clues.map((clue) => ({
        ...clue,
        answered: false,
      }));
    },
    unanswerOne: (state, action: PayloadAction<string[]>) => {
      state.clues = state.clues.map((clue) => {
        if (action.payload.includes(clue.id)) {
          return {
            ...clue,
            answered: false,
          };
        }

        return clue;
      });
    },
    updateGrid: (state, action: PayloadAction<Clue[]>) => {
      state.clues = action.payload;
    },
  },
});

export const {
  answerGrid,
  answerOne,
  select,
  unanswerGrid,
  unanswerOne,
  updateGrid,
} = cluesSlice.actions;

export const getClues = (state: RootState) => state.clues.clues;

export default cluesSlice.reducer;
