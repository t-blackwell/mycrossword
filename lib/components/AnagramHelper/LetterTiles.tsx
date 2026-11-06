import * as React from 'react';
import { getBem } from '~/utils/bem';
import { Arrangement, BoardSize, arrangeTiles, getTileSize } from './layout';
import './LetterTiles.css';

const BOUNCE_STAGGER_MS = 8;
const DEFAULT_GRID_SIZE = 10;

function measure(node: HTMLElement): BoardSize {
  const { height, width } = node.getBoundingClientRect();

  return { height, width };
}

function getMaxTileSize(node: HTMLElement) {
  const gridSize = parseFloat(
    getComputedStyle(node).getPropertyValue('--grid-size'),
  );

  return (Number.isNaN(gridSize) ? DEFAULT_GRID_SIZE : gridSize) * 4;
}

interface LetterTilesProps {
  arrangement: Arrangement;
  /** Letters in typed order */
  letters: string;
  /** Indices into `letters`, in the order the tiles are arranged */
  order: number[];
  /** Letters already in the grid, which are shown faded */
  populatedLetters: string;
}

export default function LetterTiles({
  arrangement,
  letters,
  order,
  populatedLetters,
}: LetterTilesProps) {
  const bem = getBem('LetterTiles');
  const boardRef = React.useRef<HTMLDivElement>(null);
  const [board, setBoard] = React.useState<BoardSize | null>(null);
  const [maxTileSize, setMaxTileSize] = React.useState(
    DEFAULT_GRID_SIZE * 4,
  );
  const [motion, setMotion] = React.useState<'bounce' | 'glide'>('bounce');

  // measure before the first paint, so tiles appear in place, then keep the
  // board size up to date so arrangements always fit
  React.useLayoutEffect(() => {
    const node = boardRef.current;

    if (node === null) {
      return;
    }

    setBoard(measure(node));
    setMaxTileSize(getMaxTileSize(node));

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      const next = measure(node);

      setBoard((prev) =>
        prev?.height === next.height && prev.width === next.width
          ? prev
          : next,
      );
      setMaxTileSize(getMaxTileSize(node));
      setMotion('glide');
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // shuffles and arrangement changes bounce; resizes glide
  React.useLayoutEffect(() => {
    setMotion('bounce');
  }, [order, arrangement]);

  const upperLetters = letters.toUpperCase();
  const tileSize =
    board !== null ? getTileSize(order.length, board, maxTileSize) : 0;
  const positions =
    board !== null ? arrangeTiles(order, arrangement, board, tileSize) : [];

  // fade letters that are already in the grid, working round in arranged order
  const populated = new Set<number>();
  let remaining = populatedLetters.toUpperCase();
  order.forEach((tileIndex) => {
    const letter = upperLetters[tileIndex];

    if (letter !== undefined && remaining.includes(letter)) {
      remaining = remaining.replace(letter, '');
      populated.add(tileIndex);
    }
  });

  return (
    <div
      aria-label={`Letter tiles: ${order
        .map((tileIndex) => upperLetters[tileIndex])
        .join(' ')}`}
      className={bem(
        'LetterTiles',
        motion === 'bounce' ? 'LetterTiles--bounce' : null,
      )}
      ref={boardRef}
      role="group"
      style={
        { '--LetterTiles-tileSize': `${tileSize}px` } as React.CSSProperties
      }
    >
      {board !== null
        ? // kept in typed order, so the DOM never reorders mid-animation
          upperLetters.split('').map((letter, i) => {
            const position = positions[i] ?? { x: 0, y: 0 };

            return (
              <span
                aria-hidden
                className={bem(
                  'LetterTiles__tile',
                  populated.has(i) ? 'LetterTiles__tile--populated' : null,
                )}
                key={i}
                style={{
                  transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                  transitionDelay:
                    motion === 'bounce'
                      ? `${order.indexOf(i) * BOUNCE_STAGGER_MS}ms`
                      : undefined,
                }}
              >
                <span className={bem('LetterTiles__face')}>{letter}</span>
              </span>
            );
          })
        : null}
    </div>
  );
}
