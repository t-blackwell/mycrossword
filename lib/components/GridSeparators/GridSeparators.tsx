import * as React from 'react';
import { Direction, GuardianClue } from '~/types';
import { Bar, getBars } from '~/utils/bars';

function getPos(val: number, cellSize: number) {
  return val * (cellSize + 1) + 1;
}

interface GridSeparatorProps {
  cellSize: number;
  char: ',' | '-';
  col: number;
  row: number;
  direction: Direction;
}

function GridSeparator({
  char,
  col,
  row,
  direction,
  cellSize,
}: GridSeparatorProps) {
  const top = getPos(row, cellSize);
  const left = getPos(col, cellSize);
  const across = direction === 'across';

  if (char === ',') {
    const width = across ? 1 : cellSize;
    const height = across ? cellSize : 1;
    const x = across ? left - 2 : left;
    const y = across ? top : top - 2;

    return <rect width={width} height={height} x={x} y={y} />;
  }

  if (char === '-') {
    const width = across ? cellSize * 0.25 : 1;
    const height = across ? 1 : cellSize * 0.25;
    const x = across
      ? left - 0.5 - width * 0.5
      : left + cellSize * 0.5 + width * 0.5;
    const y = across
      ? top + cellSize * 0.5 + height * 0.5
      : top - 0.5 - height * 0.5;

    return <rect width={width} height={height} x={x} y={y} />;
  }

  return <></>;
}

/**
 * Draws a bar over the grid line before a cell, three units thick so it stands
 * out from the grid lines and word separators. It overhangs each end of the
 * cell's edge so that bars meeting at a corner join up.
 */
function GridBar({ bar, cellSize }: { bar: Bar; cellSize: number }) {
  const top = getPos(bar.row, cellSize);
  const left = getPos(bar.col, cellSize);
  const across = bar.direction === 'across';

  return (
    <rect
      width={across ? 3 : cellSize + 4}
      height={across ? cellSize + 4 : 3}
      x={left - 2}
      y={top - 2}
    />
  );
}

function getGridSeparator(
  char: ',' | '-',
  pos: number,
  clue: GuardianClue,
  cellSize: number,
) {
  // don't show separators between split words i.e. in a group
  if (pos <= 0 || pos >= clue.length) {
    return null;
  }

  const x = clue.position.x + (clue.direction === 'across' ? pos : 0);
  const y = clue.position.y + (clue.direction === 'across' ? 0 : pos);
  return (
    <GridSeparator
      cellSize={cellSize}
      key={[x, y, clue.direction].join(',')}
      char={char}
      direction={clue.direction}
      col={x}
      row={y}
    />
  );
}

interface GridSeparatorsProps {
  cellSize: number;
  clues: GuardianClue[];
}

function GridSeparators({ clues, cellSize }: GridSeparatorsProps) {
  const bars = React.useMemo(() => getBars(clues), [clues]);

  return (
    <svg className="GridSeparators">
      {bars.map((bar) => (
        <GridBar
          bar={bar}
          cellSize={cellSize}
          key={['bar', bar.col, bar.row, bar.direction].join(',')}
        />
      ))}
      {clues
        .filter((clue) => Object.keys(clue.separatorLocations).length > 0)
        .map((clue) => {
          const separators = [];
          const commas = clue.separatorLocations[','];
          const hyphens = clue.separatorLocations['-'];

          if (commas !== undefined) {
            separators.push(
              commas.map((pos) => getGridSeparator(',', pos, clue, cellSize)),
            );
          }

          if (hyphens !== undefined) {
            separators.push(
              hyphens.map((pos) => getGridSeparator('-', pos, clue, cellSize)),
            );
          }

          return separators;
        })}
    </svg>
  );
}

export default React.memo(GridSeparators);
