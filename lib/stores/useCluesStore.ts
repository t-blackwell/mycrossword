import { create } from 'zustand';
import { Clue } from '~/types';

type CluesStore = {
  clues: Clue[];
  setClues: (clues: Clue[]) => void;
  select: (clueId: Clue['id']) => void;
  answerAll: (answered: Clue['answered']) => void;
  answerSome: (clueIds: Clue['id'][], answered: Clue['answered']) => void;
};

export const useCluesStore = create<CluesStore>((set) => ({
  clues: [],
  setClues: (clues) => {
    set(() => ({ clues }));
  },
  select: (clueId) => {
    set((state) => {
      // append clue to URL e.g. #1-across
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${clueId}`);
      }

      return {
        clues: state.clues.map((clue) => ({
          ...clue,
          selected: clue.id === clueId,
        })),
      };
    });
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
