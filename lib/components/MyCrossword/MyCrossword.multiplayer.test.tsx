import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMultiplayerHost } from '~/host';
import { REMOTE_SAVE_DELAY } from '~/hooks/useMultiplayer/useMultiplayer';
import validData from '~/testData/test.valid.1';
import type { MultiplayerConnection, MultiplayerMessage } from '~/types';
import { initialiseGuessGrid } from '~/utils/guess';
import MyCrossword from './MyCrossword';

const { cols, rows } = validData.dimensions;

/** Lets the batched messages be sent. */
const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Connects players to a host in memory. Messages wait in a queue (in the
 * order sent) until they're delivered, like a network.
 */
function createNetwork() {
  const host = createMultiplayerHost();
  const queue: (() => void)[] = [];

  const connect = (playerId: string, roomId = 'room') => {
    const listeners = new Set<(message: unknown) => void>();
    const hostConnection = host.connect(
      {
        send: (data) =>
          queue.push(() =>
            listeners.forEach((listener) => listener(JSON.parse(data))),
          ),
      },
      roomId,
    );

    const connection: MultiplayerConnection = {
      playerId,
      send: (message) => {
        const data = JSON.stringify(message);
        queue.push(() => hostConnection.receive(data));
      },
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };

    return connection;
  };

  /** Delivers the messages until there are none left. */
  const deliver = () =>
    act(async () => {
      await flushMicrotasks();

      while (queue.length > 0) {
        while (queue.length > 0) {
          queue.shift()!();
        }

        await flushMicrotasks();
      }
    });

  return { connect, deliver, host };
}

/** A connection that records what's sent and receives what the test emits. */
function createFakeConnection(playerId = 'me') {
  const listeners = new Set<(message: unknown) => void>();
  const sent: MultiplayerMessage[] = [];

  const connection: MultiplayerConnection = {
    playerId,
    send: (message) => sent.push(message),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  const emit = (message: unknown) =>
    act(() => listeners.forEach((listener) => listener(message)));

  return { connection, emit, listeners, sent };
}

const getGuesses = (element: HTMLElement) =>
  Array.from(
    element.querySelectorAll('.GridCell__text'),
    (text) => text.textContent,
  ).join('');

beforeEach(() => {
  localStorage.clear();
});

test('players see each other’s letters', async () => {
  const user = userEvent.setup();
  const network = createNetwork();
  const onCellChange = vi.fn();

  render(
    <>
      <div data-testid="alice">
        <MyCrossword
          data={validData}
          id="alice"
          multiplayer={network.connect('alice')}
        />
      </div>
      <div data-testid="bob">
        <MyCrossword
          data={validData}
          id="bob"
          multiplayer={network.connect('bob')}
          onCellChange={onCellChange}
        />
      </div>
    </>,
  );
  await network.deliver();

  const alice = screen.getByTestId('alice');
  const bob = screen.getByTestId('bob');

  await user.click(within(alice).getByText('Toy on a string (2-2)'));
  await user.keyboard('yoyo');
  await network.deliver();

  expect(getGuesses(bob)).toBe('YOYO');
  expect(within(bob).getByRole('button', { name: /^1\s*across/ })).toHaveClass(
    'Clue--answered',
  );
  expect(network.host.getGrid('room')?.value[3][0]).toBe('O');

  // other players' changes aren't reported as the player's own
  expect(onCellChange).not.toHaveBeenCalled();

  // and changes go both ways, e.g. clearing a word
  await user.click(within(bob).getByText('Toy on a string (2-2)'));
  await user.click(within(bob).getByRole('button', { name: 'Clear' }));
  await user.click(within(bob).getByRole('button', { name: 'Clear word' }));
  await network.deliver();

  expect(getGuesses(bob)).toBe('');
  expect(getGuesses(alice)).toBe('');
  expect(
    within(alice).getByRole('button', { name: /^1\s*across/ }),
  ).not.toHaveClass('Clue--answered');
});

test('a player joining later starts from the room’s grid', async () => {
  const network = createNetwork();
  const savedGrid = initialiseGuessGrid(cols, rows);
  savedGrid.value[0][2] = 'L';
  savedGrid.value[1][2] = 'I';

  // the first player starts the room off with its progress
  render(
    <div data-testid="alice">
      <MyCrossword
        data={validData}
        id="alice"
        loadGrid={savedGrid}
        multiplayer={network.connect('alice')}
      />
    </div>,
  );
  await network.deliver();

  render(
    <div data-testid="bob">
      <MyCrossword
        data={validData}
        id="bob"
        multiplayer={network.connect('bob')}
      />
    </div>,
  );
  await network.deliver();

  expect(getGuesses(screen.getByTestId('bob'))).toBe('LI');
});

test('players editing the same cell at once end up with the same letter', async () => {
  const user = userEvent.setup();
  const network = createNetwork();

  render(
    <>
      <div data-testid="alice">
        <MyCrossword
          data={validData}
          id="alice"
          multiplayer={network.connect('alice')}
        />
      </div>
      <div data-testid="bob">
        <MyCrossword
          data={validData}
          id="bob"
          multiplayer={network.connect('bob')}
        />
      </div>
    </>,
  );
  await network.deliver();

  const alice = screen.getByTestId('alice');
  const bob = screen.getByTestId('bob');

  // both type in the first cell before either hears from the other
  await user.click(within(alice).getByText('Toy on a string (2-2)'));
  await user.keyboard('a');
  await user.click(within(bob).getByText('Toy on a string (2-2)'));
  await user.keyboard('b');

  expect(getGuesses(alice)).toBe('A');
  expect(getGuesses(bob)).toBe('B');

  await network.deliver();

  // the host received Bob's letter last, so it wins for everyone
  expect(network.host.getGrid('room')?.value[0][0]).toBe('B');
  expect(getGuesses(alice)).toBe('B');
  expect(getGuesses(bob)).toBe('B');
});

test('other players’ selected cells are shown', async () => {
  const user = userEvent.setup();
  const network = createNetwork();

  const { container: bob } = render(
    <MyCrossword
      data={validData}
      id="bob"
      multiplayer={network.connect('bob')}
    />,
  );
  const { container: alice, unmount } = render(
    <MyCrossword
      data={validData}
      id="alice"
      multiplayer={network.connect('alice')}
    />,
  );
  await network.deliver();

  expect(bob.querySelector('.Grid__remoteSelection')).toBeNull();

  await user.click(within(alice).getByText('Have a rest (3,4)'));
  await network.deliver();

  const selection = bob.querySelector('.Grid__remoteSelection');
  expect(selection).toHaveAttribute('data-player-id', 'alice');
  // the first cell of 4 across, at column 0 and row 2
  expect(selection).toHaveAttribute('x', '2');
  expect(selection).toHaveAttribute('y', String(1 + 32 * 2 + 1));

  // moving on, and with the cell and clue selected separately, one message
  await user.keyboard('l');
  await network.deliver();

  expect(bob.querySelector('.Grid__remoteSelection')).toHaveAttribute(
    'x',
    String(1 + 32 + 1),
  );
  expect(alice.querySelector('.Grid__remoteSelection')).toBeNull();

  unmount();
  await network.deliver();

  expect(bob.querySelector('.Grid__remoteSelection')).toBeNull();
});

test('a player joining is told where the other players are', async () => {
  const user = userEvent.setup();
  const network = createNetwork();

  const { container: alice } = render(
    <MyCrossword
      data={validData}
      id="alice"
      multiplayer={network.connect('alice')}
    />,
  );
  await network.deliver();
  await user.click(within(alice).getByText('Colour (6)'));
  await network.deliver();

  const { container: bob } = render(
    <MyCrossword
      data={validData}
      id="bob"
      multiplayer={network.connect('bob')}
    />,
  );
  await network.deliver();

  expect(bob.querySelector('.Grid__remoteSelection')).toHaveAttribute(
    'data-player-id',
    'alice',
  );
});

test('it joins, sends its grid when the host has none, and leaves', async () => {
  const { connection, emit, listeners, sent } = createFakeConnection();
  const savedGrid = initialiseGuessGrid(cols, rows);
  savedGrid.value[0][0] = 'Y';

  const { unmount } = render(
    <MyCrossword
      data={validData}
      id="test"
      loadGrid={savedGrid}
      multiplayer={connection}
    />,
  );

  expect(sent).toEqual([{ type: 'join', playerId: 'me' }]);

  await emit({ type: 'sync', grid: null });
  expect(sent[1]).toEqual({ type: 'sync', grid: savedGrid });

  unmount();
  expect(sent[2]).toEqual({ type: 'leave', playerId: 'me' });
  expect(listeners.size).toBe(0);
});

test('it rejoins when given a new connection', () => {
  const first = createFakeConnection('first');
  const second = createFakeConnection('second');

  const { rerender } = render(
    <MyCrossword data={validData} id="test" multiplayer={first.connection} />,
  );
  rerender(
    <MyCrossword data={validData} id="test" multiplayer={second.connection} />,
  );

  expect(first.sent).toEqual([
    { type: 'join', playerId: 'first' },
    { type: 'leave', playerId: 'first' },
  ]);
  expect(second.sent).toEqual([{ type: 'join', playerId: 'second' }]);
  expect(first.listeners.size).toBe(0);
});

test('a player id is generated if the connection has none', () => {
  const sent: MultiplayerMessage[] = [];

  render(
    <MyCrossword
      data={validData}
      id="test"
      multiplayer={{
        send: (message) => sent.push(message),
        subscribe: () => () => {},
      }}
    />,
  );

  expect(sent).toEqual([{ type: 'join', playerId: expect.any(String) }]);
});

test('changes made together are sent together', async () => {
  const user = userEvent.setup();
  const { connection, sent } = createFakeConnection();

  render(<MyCrossword data={validData} id="test" multiplayer={connection} />);

  await user.click(screen.getByText('Toy on a string (2-2)'));
  await user.click(screen.getByRole('button', { name: 'Reveal' }));
  await user.click(screen.getByRole('button', { name: 'Reveal word' }));
  await act(flushMicrotasks);

  expect(sent.filter((message) => message.type === 'cells')).toEqual([
    {
      type: 'cells',
      playerId: 'me',
      changes: [
        { pos: { col: 0, row: 0 }, guess: 'Y' },
        { pos: { col: 1, row: 0 }, guess: 'O' },
        { pos: { col: 2, row: 0 }, guess: 'Y' },
        { pos: { col: 3, row: 0 }, guess: 'O' },
      ],
    },
  ]);
  expect(sent.filter((message) => message.type === 'focus')).toEqual([
    {
      type: 'focus',
      playerId: 'me',
      pos: { col: 0, row: 0 },
      clueId: '1-across',
    },
  ]);
});

test('other players’ changes are saved, and can complete the crossword', async () => {
  vi.useFakeTimers();

  try {
    const { connection, emit } = createFakeConnection();
    const saveGrid = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(
      <MyCrossword
        data={validData}
        id="test"
        multiplayer={connection}
        onComplete={onComplete}
        saveGrid={saveGrid}
      />,
    );

    const solved = initialiseGuessGrid(cols, rows);
    validData.entries.forEach(({ direction, position, solution = '' }) => {
      [...solution].forEach((char, i) => {
        const col = position.x + (direction === 'across' ? i : 0);
        const row = position.y + (direction === 'down' ? i : 0);
        solved.value[col][row] = char as 'A';
      });
    });

    await emit({
      type: 'cells',
      playerId: 'other',
      changes: [{ pos: { col: 0, row: 0 }, guess: 'Y' }],
    });

    expect(getGuesses(container)).toBe('Y');
    expect(saveGrid).not.toHaveBeenCalled();

    // the whole grid, from the host
    await emit({ type: 'sync', grid: solved });

    expect(onComplete).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(REMOTE_SAVE_DELAY));

    expect(saveGrid).toHaveBeenCalledTimes(1);
    expect(saveGrid).toHaveBeenCalledWith(solved);
  } finally {
    vi.useRealTimers();
  }
});

test('invalid messages and the player’s own messages are ignored', async () => {
  const { connection, emit, sent } = createFakeConnection();
  const { container } = render(
    <MyCrossword data={validData} id="test" multiplayer={connection} />,
  );

  await emit({
    type: 'cells',
    playerId: 'other',
    changes: [{ pos: { col: 0, row: 0 }, guess: 'y' }],
  });
  await emit({
    type: 'cells',
    playerId: 'other',
    changes: [{ pos: { col: 13, row: 0 }, guess: 'Y' }],
  });
  await emit({ type: 'sync', grid: { value: [['A']] } });
  await emit({
    type: 'focus',
    playerId: 'me',
    pos: { col: 0, row: 0 },
    clueId: '1-across',
  });
  await emit({ type: 'join', playerId: 'me' });
  await emit('nonsense');

  expect(getGuesses(container)).toBe('');
  expect(container.querySelector('.Grid__remoteSelection')).toBeNull();
  expect(sent).toEqual([{ type: 'join', playerId: 'me' }]);

  // a cell that isn't in the grid isn't shown as selected
  await emit({
    type: 'focus',
    playerId: 'other',
    pos: { col: 12, row: 12 },
    clueId: '1-across',
  });
  expect(container.querySelector('.Grid__remoteSelection')).toBeNull();
});

test('other players’ changes wait for the player’s own to reach the host', async () => {
  const user = userEvent.setup();
  const { connection, emit, sent } = createFakeConnection();
  const { container } = render(
    <MyCrossword data={validData} id="test" multiplayer={connection} />,
  );

  await user.click(screen.getByText('Toy on a string (2-2)'));
  await user.keyboard('a');
  await act(flushMicrotasks);

  const ownChanges = sent.find((message) => message.type === 'cells');
  const otherChange = {
    type: 'cells',
    playerId: 'other',
    changes: [{ pos: { col: 0, row: 0 }, guess: 'B' }],
  };

  // the host had the other player's change first, so ours wins
  await emit(otherChange);
  expect(getGuesses(container)).toBe('A');

  await emit(ownChanges);
  expect(getGuesses(container)).toBe('A');

  // and once ours has reached the host, later changes apply
  await emit(otherChange);
  expect(getGuesses(container)).toBe('B');
});
