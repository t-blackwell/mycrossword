import { CellPosition, Direction, GuardianClue } from '~/types';
import { getCellKey } from '~/utils/cell';

/**
 * A bar between a cell and the cell before it: the cell to its left for an
 * `across` bar, or the cell above it for a `down` bar.
 */
export type Bar = CellPosition & { direction: Direction };

/**
 * Finds the bars of a barred grid from its entries.
 *
 * Cells are only drawn where there's an entry, so a blocked grid's blocks are
 * the gaps between entries. A barred grid has no blocks: every cell is in an
 * entry and bars mark where the entries start and end. A bar goes between two
 * neighbouring cells in a row (or column) that aren't in the same across (or
 * down) entry.
 *
 * In a blocked grid, neighbouring cells in a row (or column) are always in the
 * same entry, so it has no bars.
 */
export function getBars(entries: GuardianClue[]): Bar[] {
  // the across and down entry ids of each cell (an empty string if none)
  const cells = new Map<string, { across: string; down: string }>();

  entries.forEach((entry) => {
    const across = entry.direction === 'across';

    for (let i = 0; i < entry.length; i += 1) {
      const col = across ? entry.position.x + i : entry.position.x;
      const row = across ? entry.position.y : entry.position.y + i;
      const key = getCellKey({ col, row });
      const cell = cells.get(key) ?? { across: '', down: '' };

      cells.set(key, { ...cell, [entry.direction]: entry.id });
    }
  });

  const bars: Bar[] = [];

  cells.forEach((cell, key) => {
    const [col, row] = key.split(',').map(Number);
    const left = cells.get(getCellKey({ col: col - 1, row }));
    const above = cells.get(getCellKey({ col, row: row - 1 }));

    if (
      left !== undefined &&
      (left.across === '' || left.across !== cell.across)
    ) {
      bars.push({ col, row, direction: 'across' });
    }

    if (
      above !== undefined &&
      (above.down === '' || above.down !== cell.down)
    ) {
      bars.push({ col, row, direction: 'down' });
    }
  });

  return bars.sort((a, b) => a.row - b.row || a.col - b.col);
}
