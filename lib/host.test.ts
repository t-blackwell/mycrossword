import { createMultiplayerHost, MultiplayerHost } from './host';
import { initialiseGuessGrid } from './utils/guess';

/** A player connected to the host, recording the messages it's sent. */
function connectPlayer(host: MultiplayerHost, roomId = 'room') {
  const received: unknown[] = [];
  const connection = host.connect(
    { send: (data) => received.push(JSON.parse(data)) },
    roomId,
  );

  return {
    received,
    send: (message: unknown) => connection.receive(JSON.stringify(message)),
    close: connection.close,
    /** Returns and clears the messages received. */
    take: () => received.splice(0),
  };
}

const grid = () => {
  const value = initialiseGuessGrid(3, 2);
  value.value[0][0] = 'A';
  return value;
};

test('a room starts with the first grid sent by a player', () => {
  const host = createMultiplayerHost();
  const alice = connectPlayer(host);

  alice.send({ type: 'join', playerId: 'alice' });
  expect(alice.take()).toEqual([{ type: 'sync', grid: null }]);

  alice.send({ type: 'sync', grid: grid() });
  expect(host.getGrid('room')).toEqual(grid());
  expect(alice.take()).toEqual([]);

  // a player joining later gets the grid, and the others are told
  const bob = connectPlayer(host);
  bob.send({ type: 'join', playerId: 'bob' });

  expect(bob.take()).toEqual([{ type: 'sync', grid: grid() }]);
  expect(alice.take()).toEqual([{ type: 'join', playerId: 'bob' }]);
});

test('a grid sent once the room has one is replaced by the room’s grid', () => {
  const host = createMultiplayerHost();
  const alice = connectPlayer(host);
  const bob = connectPlayer(host);

  // both join before either starts the room off
  alice.send({ type: 'join', playerId: 'alice' });
  bob.send({ type: 'join', playerId: 'bob' });
  alice.take();
  bob.take();

  alice.send({ type: 'sync', grid: grid() });
  expect(bob.take()).toEqual([{ type: 'sync', grid: grid() }]);

  bob.send({ type: 'sync', grid: initialiseGuessGrid(3, 2) });
  expect(bob.take()).toEqual([{ type: 'sync', grid: grid() }]);
  expect(host.getGrid('room')).toEqual(grid());
});

test('changes are applied to the grid and sent to every player in order', () => {
  const host = createMultiplayerHost();
  const alice = connectPlayer(host);
  const bob = connectPlayer(host);
  const other = connectPlayer(host, 'another room');

  alice.send({ type: 'join', playerId: 'alice' });
  alice.send({ type: 'sync', grid: grid() });
  bob.send({ type: 'join', playerId: 'bob' });
  other.send({ type: 'join', playerId: 'other' });
  [alice, bob, other].forEach((player) => player.take());

  const aliceChange = { pos: { col: 1, row: 1 }, guess: 'B' };
  const bobChange = { pos: { col: 1, row: 1 }, guess: 'C' };
  alice.send({ type: 'cells', playerId: 'alice', changes: [aliceChange] });
  // the id a player joined with is used, so players can't pose as others
  bob.send({ type: 'cells', playerId: 'alice', changes: [bobChange] });

  const expected = [
    { type: 'cells', playerId: 'alice', changes: [aliceChange] },
    { type: 'cells', playerId: 'bob', changes: [bobChange] },
  ];
  expect(alice.take()).toEqual(expected);
  expect(bob.take()).toEqual(expected);
  expect(other.take()).toEqual([]);
  expect(host.getGrid('room')?.value[1][1]).toBe('C');

  // a cleared cell
  bob.send({
    type: 'cells',
    playerId: 'bob',
    changes: [{ pos: { col: 0, row: 0 }, guess: '' }],
  });
  expect(host.getGrid('room')?.value[0][0]).toBe('');
});

test('changes made before the room has a grid are applied to it', () => {
  const host = createMultiplayerHost();
  const alice = connectPlayer(host);

  alice.send({ type: 'join', playerId: 'alice' });
  alice.send({
    type: 'cells',
    playerId: 'alice',
    changes: [{ pos: { col: 2, row: 1 }, guess: 'Z' }],
  });
  alice.send({ type: 'sync', grid: grid() });

  expect(host.getGrid('room')?.value[2][1]).toBe('Z');
  expect(host.getGrid('room')?.value[0][0]).toBe('A');
});

test('a player’s selection is sent to the other players', () => {
  const host = createMultiplayerHost();
  const alice = connectPlayer(host);
  const bob = connectPlayer(host);

  alice.send({ type: 'join', playerId: 'alice' });
  bob.send({ type: 'join', playerId: 'bob' });
  alice.take();
  bob.take();

  alice.send({
    type: 'focus',
    playerId: 'alice',
    pos: { col: 1, row: 0 },
    clueId: '1-across',
  });

  expect(alice.take()).toEqual([]);
  expect(bob.take()).toEqual([
    {
      type: 'focus',
      playerId: 'alice',
      pos: { col: 1, row: 0 },
      clueId: '1-across',
    },
  ]);
});

test('the other players are told when a player leaves or disconnects', () => {
  const host = createMultiplayerHost();
  const alice = connectPlayer(host);
  const bob = connectPlayer(host);

  alice.send({ type: 'join', playerId: 'alice' });
  bob.send({ type: 'join', playerId: 'bob' });
  alice.take();

  bob.send({ type: 'leave', playerId: 'bob' });
  expect(alice.take()).toEqual([{ type: 'leave', playerId: 'bob' }]);

  // having left, its messages aren't sent on
  bob.send({
    type: 'focus',
    playerId: 'bob',
    pos: { col: 0, row: 0 },
    clueId: '1-across',
  });
  expect(alice.take()).toEqual([]);

  // rejoining with a new id replaces the old one
  bob.send({ type: 'join', playerId: 'bob-2' });
  bob.send({ type: 'join', playerId: 'bob-3' });
  expect(alice.take()).toEqual([
    { type: 'join', playerId: 'bob-2' },
    { type: 'leave', playerId: 'bob-2' },
    { type: 'join', playerId: 'bob-3' },
  ]);

  bob.close();
  expect(alice.take()).toEqual([{ type: 'leave', playerId: 'bob-3' }]);
});

test('a room is removed when its last player disconnects', () => {
  const host = createMultiplayerHost();
  const alice = connectPlayer(host);
  const bob = connectPlayer(host);

  alice.send({ type: 'join', playerId: 'alice' });
  alice.send({ type: 'sync', grid: grid() });
  expect(host.getRoomIds()).toEqual(['room']);

  alice.close();
  expect(host.getRoomIds()).toEqual(['room']);

  bob.close();
  expect(host.getRoomIds()).toEqual([]);
  expect(host.getGrid('room')).toBeNull();
});

test('invalid messages are ignored', () => {
  const host = createMultiplayerHost({ maxGridSize: 5 });
  const alice = connectPlayer(host);
  const bob = connectPlayer(host);

  // nothing is accepted before joining
  bob.send({ type: 'sync', grid: grid() });
  expect(host.getGrid('room')).toBeNull();

  alice.send({ type: 'join', playerId: 'alice' });
  bob.send({ type: 'join', playerId: '' });
  bob.send({ type: 'join', playerId: 'bob' });
  alice.take();

  // grids that are too big or have invalid guesses
  bob.send({ type: 'sync', grid: initialiseGuessGrid(6, 2) });
  bob.send({
    type: 'sync',
    grid: {
      value: [
        ['a', ''],
        ['', ''],
      ],
    },
  });
  bob.send({ type: 'sync', grid: { value: [['A', ''], ['']] } });
  expect(host.getGrid('room')).toBeNull();

  bob.send({ type: 'sync', grid: grid() });

  const invalid = [
    'not JSON',
    JSON.stringify(['join']),
    JSON.stringify({
      type: 'cells',
      changes: [{ pos: { col: 3, row: 0 }, guess: 'A' }],
    }),
    JSON.stringify({
      type: 'cells',
      changes: [{ pos: { col: 0, row: 0 }, guess: 'AB' }],
    }),
    JSON.stringify({ type: 'focus', pos: { col: 0, row: 2 }, clueId: 'a' }),
    JSON.stringify({ type: 'focus', pos: { col: 0, row: 0 } }),
  ];

  const connection = host.connect({ send: () => {} }, 'room');
  connection.receive(JSON.stringify({ type: 'join', playerId: 'carol' }));
  alice.take();
  invalid.forEach((data) => connection.receive(data));

  expect(alice.take()).toEqual([]);
  expect(host.getGrid('room')).toEqual(grid());
});
