import { createStore } from 'zustand/vanilla';
import { Clue } from '~/types';

export type CluesState = {
  clues: Clue[];
  setClues: (clues: Clue[]) => void;
  select: (clueId: Clue['id']) => void;
  answerAll: (answered: Clue['answered']) => void;
  answerSome: (clueIds: Clue['id'][], answered: Clue['answered']) => void;
};

/**
 * Creates the clues store for a single crossword. Each crossword has its own
 * store (provided via React context) so crosswords on the same page don't
 * share state.
 */
export function createCluesStore() {
  return createStore<CluesState>()((set) => ({
    clues: [],
    setClues: (clues) => {
      set(() => ({ clues }));
    },
    select: (clueId) => {
      set((state) => ({
        clues: state.clues.map((clue) => ({
          ...clue,
          selected: clue.id === clueId,
        })),
      }));
    },
    answerAll: (answered) => {
      set((state) => {
        return {
          clues: state.clues.map((clue) => ({
            ...clue,
            answered,
          })),
        };
      });
    },
    answerSome: (clueIds, answered) => {
      set((state) => {
        return {
          clues: state.clues.map((clue) => {
            if (clueIds.includes(clue.id)) {
              return {
                ...clue,
                answered,
              };
            }

            return clue;
          }),
        };
      });
    },
  }));
}

export type CluesStore = ReturnType<typeof createCluesStore>;
