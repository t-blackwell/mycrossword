import { GuardianCrossword, GuessGrid } from '~/types';
import { initialiseCells } from './cell';
import { initialiseClues } from './clue';
import { useCellsStore } from '~/stores/useCellsStore';
import { useCluesStore } from '~/stores/useCluesStore';

export function initialiseStores(
  data: GuardianCrossword,
  guessGrid?: GuessGrid,
) {
  const cells = initialiseCells({
    cols: data.dimensions.cols,
    rows: data.dimensions.rows,
    entries: data.entries,
    guessGrid,
  });

  const clues = initialiseClues(data.entries, cells);

  useCellsStore.setState({ cells });
  useCluesStore.setState({ clues });
}
