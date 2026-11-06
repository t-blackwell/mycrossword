import {
  BOARD_PADDING,
  MIN_TILE_SIZE,
  arrangeTiles,
  getRowPositions,
  getTileSize,
  getWheelPositions,
  shuffle,
  shuffleChanged,
  typedOrder,
} from './layout';

const board = { width: 400, height: 200 };
const size = 40;

describe('shuffle', () => {
  test('returns a permutation without mutating', () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffle(items);

    expect(items).toEqual([1, 2, 3, 4, 5]);
    expect([...result].sort()).toEqual(items);
  });

  test('uses the random source', () => {
    // always picking j = 0 rotates the first item to the end
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });
});

describe('shuffleChanged', () => {
  test('retries until the order changes', () => {
    // first shuffle returns the same order, the retry doesn't
    const values = [0.99, 0.99, 0, 0];
    const random = () => values.shift() ?? 0;

    expect(shuffleChanged([1, 2, 3], random)).toEqual([2, 3, 1]);
  });

  test('copes with a single item', () => {
    expect(shuffleChanged([1])).toEqual([1]);
  });
});

test('typedOrder', () => {
  expect(typedOrder(0)).toEqual([]);
  expect(typedOrder(4)).toEqual([0, 1, 2, 3]);
});

describe('getRowPositions', () => {
  test('centres a single row', () => {
    const positions = getRowPositions(3, board, size);

    // 3 tiles of 40px with 8px gaps = 136px wide
    expect(positions).toEqual([
      { x: 132, y: 80 },
      { x: 180, y: 80 },
      { x: 228, y: 80 },
    ]);
  });

  test('wraps onto more rows when needed', () => {
    const positions = getRowPositions(10, board, size);
    const rows = new Set(positions.map(({ y }) => y));

    expect(rows.size).toBe(2);
    positions.forEach(({ x }) => {
      expect(x).toBeGreaterThanOrEqual(BOARD_PADDING);
      expect(x + size).toBeLessThanOrEqual(board.width - BOARD_PADDING);
    });
  });
});

describe('getWheelPositions', () => {
  test('centres a single tile', () => {
    expect(getWheelPositions(1, board, size)).toEqual([{ x: 180, y: 80 }]);
  });

  test('has no central letter', () => {
    const centre = { x: board.width / 2, y: board.height / 2 };

    [2, 5, 9].forEach((count) => {
      const distances = getWheelPositions(count, board, size).map(({ x, y }) =>
        Math.hypot(x + size / 2 - centre.x, y + size / 2 - centre.y),
      );

      // every tile is on the circle, the same distance from the centre
      distances.forEach((distance) => {
        expect(distance).toBeGreaterThan(size / 2);
        expect(distance).toBeCloseTo(distances[0]);
      });
    });
  });

  test('starts at the top and goes clockwise', () => {
    const [first, second] = getWheelPositions(4, board, size);

    expect(first.x).toBeCloseTo(180);
    expect(first.y).toBeLessThan(80);
    expect(second.x).toBeGreaterThan(180);
    expect(second.y).toBeCloseTo(80);
  });
});

describe('getTileSize', () => {
  test('uses the max size when there is room', () => {
    expect(getTileSize(5, board, size)).toBe(size);
  });

  test('shrinks to fit lots of letters', () => {
    const tileSize = getTileSize(20, board, size);

    expect(tileSize).toBeLessThan(size);
    expect(tileSize).toBeGreaterThanOrEqual(MIN_TILE_SIZE);
  });

  test('never goes below the min size', () => {
    expect(getTileSize(30, { width: 0, height: 0 }, size)).toBe(MIN_TILE_SIZE);
  });
});

test('arrangeTiles positions each tile by its place in the order', () => {
  const slots = getRowPositions(3, board, size);

  expect(arrangeTiles([2, 0, 1], 'row', board, size)).toEqual([
    slots[1],
    slots[2],
    slots[0],
  ]);
});
