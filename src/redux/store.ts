/* eslint-disable import/no-cycle */
import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import cellsReducer from './cellsSlice';
import cluesReducer from './cluesSlice';

export const store = configureStore({
  reducer: {
    cells: cellsReducer,
    clues: cluesReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
