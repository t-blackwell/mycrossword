import { DEFAULT_CELL_MATCHER } from './general';
import { initialiseGuessGrid } from './guess';
import {
  createPlayerId,
  getPlayerColour,
  parseMultiplayerMessage,
  PLAYER_COLOURS,
} from './multiplayer';

const parse = (message: unknown) =>
  parseMultiplayerMessage(message, 3, 2, DEFAULT_CELL_MATCHER);

test('it parses join and leave messages', () => {
  expect(parse({ type: 'join', playerId: 'a' })).toEqual({
    type: 'join',
    playerId: 'a',
  });
  expect(parse({ type: 'leave', playerId: 'a', extra: true })).toEqual({
    type: 'leave',
    playerId: 'a',
  });
  expect(parse({ type: 'join', playerId: '' })).toBeNull();
  expect(parse({ type: 'join', playerId: 'x'.repeat(101) })).toBeNull();
  expect(parse({ type: 'leave' })).toBeNull();
});

test('it parses sync messages', () => {
  const grid = initialiseGuessGrid(3, 2);
  grid.value[1][0] = 'A';

  expect(parse({ type: 'sync', grid: null })).toEqual({
    type: 'sync',
    grid: null,
  });
  expect(parse({ type: 'sync', grid })).toEqual({ type: 'sync', grid });

  // the wrong size or invalid characters
  expect(parse({ type: 'sync', grid: initialiseGuessGrid(2, 2) })).toBeNull();
  grid.value[0][0] = 'a' as 'A';
  expect(parse({ type: 'sync', grid })).toBeNull();
  expect(parse({ type: 'sync', grid: { value: 'AB' } })).toBeNull();
  expect(parse({ type: 'sync' })).toBeNull();
});

test('it parses cells messages', () => {
  const changes = [
    { pos: { col: 0, row: 0 }, guess: 'A' },
    { pos: { col: 2, row: 1 }, guess: '' },
  ];

  expect(parse({ type: 'cells', playerId: 'a', changes })).toEqual({
    type: 'cells',
    playerId: 'a',
    changes,
  });

  const invalidChanges = [
    [{ pos: { col: 3, row: 0 }, guess: 'A' }], // out of bounds
    [{ pos: { col: -1, row: 0 }, guess: 'A' }],
    [{ pos: { col: 0.5, row: 0 }, guess: 'A' }],
    [{ pos: { col: 0, row: 0 }, guess: '1' }], // not matched by cellMatcher
    [{ pos: { col: 0, row: 0 }, guess: 'AB' }],
    [{ pos: { col: 0, row: 0 } }],
    [null],
    'A',
  ];

  invalidChanges.forEach((invalid) => {
    expect(
      parse({ type: 'cells', playerId: 'a', changes: invalid }),
    ).toBeNull();
  });

  expect(parse({ type: 'cells', changes })).toBeNull();
});

test('it parses focus messages', () => {
  expect(
    parse({
      type: 'focus',
      playerId: 'a',
      pos: { col: 1, row: 1 },
      clueId: '1-across',
    }),
  ).toEqual({
    type: 'focus',
    playerId: 'a',
    pos: { col: 1, row: 1 },
    clueId: '1-across',
  });
  expect(
    parse({
      type: 'focus',
      playerId: 'a',
      pos: { col: 1, row: 2 },
      clueId: 'x',
    }),
  ).toBeNull();
  expect(
    parse({ type: 'focus', playerId: 'a', pos: { col: 1, row: 1 } }),
  ).toBeNull();
});

test('it ignores unknown and invalid messages', () => {
  expect(parse({ type: 'chat', text: 'hello' })).toBeNull();
  expect(parse(null)).toBeNull();
  expect(parse('join')).toBeNull();
  expect(parse([{ type: 'join', playerId: 'a' }])).toBeNull();
});

test('each player has the same colour for everyone', () => {
  expect(getPlayerColour('player-1')).toBe(getPlayerColour('player-1'));
  expect(PLAYER_COLOURS).toContain(getPlayerColour('player-1'));

  // the colours are spread between players
  const colours = new Set(
    Array.from({ length: 50 }, (_, i) => getPlayerColour(`player-${i}`)),
  );
  expect(colours.size).toBeGreaterThan(4);
});

test('it creates unique player ids', () => {
  expect(createPlayerId()).not.toBe(createPlayerId());
});
