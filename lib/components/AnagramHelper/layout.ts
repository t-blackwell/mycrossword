export type BoardSize = { height: number; width: number };

export type Position = { x: number; y: number };

/** Space around the edge of the board, in px */
export const BOARD_PADDING = 8;

/** Smallest tile size, in px */
export const MIN_TILE_SIZE = 16;

/** Unbiased Fisher-Yates shuffle, returning a new array */
export function shuffle<T>(items: T[], random = Math.random) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/** Shuffle, retrying a few times so the order visibly changes */
export function shuffleChanged<T>(items: T[], random = Math.random) {
  const isUnchanged = (result: T[]) =>
    items.every((item, i) => item === result[i]);

  let result = shuffle(items, random);

  for (let i = 0; i < 5 && isUnchanged(result); i++) {
    result = shuffle(items, random);
  }

  return result;
}

/** The typed order of `count` tiles, i.e. [0, 1, ..., count - 1] */
export function typedOrder(count: number) {
  return Array.from({ length: count }, (_, i) => i);
}

function getWheelRadius(count: number, tileSize: number) {
  // roomy spacing so square corners don't touch
  return Math.max((count * tileSize * 1.5) / (2 * Math.PI), tileSize * 1.2);
}

function getMaxWheelRadius(board: BoardSize, tileSize: number) {
  return Math.min(board.width, board.height) / 2 - tileSize / 2 - BOARD_PADDING;
}

function wheelFits(count: number, board: BoardSize, tileSize: number) {
  if (count <= 1) {
    return tileSize <= Math.min(board.width, board.height) - BOARD_PADDING * 2;
  }

  return getWheelRadius(count, tileSize) <= getMaxWheelRadius(board, tileSize);
}

/** The largest tile size (up to `maxSize`) that fits the wheel */
export function getTileSize(count: number, board: BoardSize, maxSize: number) {
  for (let size = Math.floor(maxSize); size > MIN_TILE_SIZE; size--) {
    if (wheelFits(count, board, size)) {
      return size;
    }
  }

  return MIN_TILE_SIZE;
}

/** Evenly spaced clockwise from the top, with no central letter */
export function getWheelPositions(
  count: number,
  board: BoardSize,
  tileSize: number,
): Position[] {
  const centreX = board.width / 2;
  const centreY = board.height / 2;

  if (count === 1) {
    return [{ x: centreX - tileSize / 2, y: centreY - tileSize / 2 }];
  }

  const radius = Math.max(
    Math.min(
      getWheelRadius(count, tileSize),
      getMaxWheelRadius(board, tileSize),
    ),
    tileSize / 2,
  );

  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (i / count) * 2 * Math.PI;

    return {
      x: centreX + radius * Math.cos(angle) - tileSize / 2,
      y: centreY + radius * Math.sin(angle) - tileSize / 2,
    };
  });
}

/**
 * The position of each tile (in typed order), given the order they should be
 * arranged in.
 */
export function arrangeTiles(
  order: number[],
  board: BoardSize,
  tileSize: number,
): Position[] {
  const slots = getWheelPositions(order.length, board, tileSize);
  const positions: Position[] = [];

  order.forEach((tileIndex, slot) => {
    positions[tileIndex] = slots[slot];
  });

  return positions;
}
