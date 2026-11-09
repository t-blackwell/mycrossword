import { createWebSocketConnection } from './webSocketConnection';

/** A WebSocket that records what's sent and can be opened and messaged. */
class FakeWebSocket extends EventTarget {
  readyState = 0;
  sent: string[] = [];
  url: string;

  constructor(url: string | URL) {
    super();
    this.url = url.toString();
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = 3;
  }

  open() {
    this.readyState = 1;
    this.dispatchEvent(new Event('open'));
  }

  receive(data: unknown) {
    this.dispatchEvent(new MessageEvent('message', { data }));
  }
}

const asWebSocket = (socket: FakeWebSocket) => socket as unknown as WebSocket;

test('it sends messages as JSON, once the socket has opened', () => {
  const socket = new FakeWebSocket('ws://host');
  const connection = createWebSocketConnection(asWebSocket(socket), {
    playerId: 'me',
  });

  expect(connection.playerId).toBe('me');
  expect(connection.socket).toBe(socket);

  connection.send({ type: 'join', playerId: 'me' });
  expect(socket.sent).toEqual([]);

  socket.open();
  connection.send({ type: 'leave', playerId: 'me' });

  expect(socket.sent.map((data) => JSON.parse(data))).toEqual([
    { type: 'join', playerId: 'me' },
    { type: 'leave', playerId: 'me' },
  ]);

  // messages sent once it's closed are dropped
  connection.close();
  connection.send({ type: 'join', playerId: 'me' });
  expect(socket.sent).toHaveLength(2);
});

test('it passes received JSON messages to subscribers', () => {
  const socket = new FakeWebSocket('ws://host');
  const connection = createWebSocketConnection(asWebSocket(socket));
  const listener = vi.fn();

  const unsubscribe = connection.subscribe(listener);
  socket.receive(JSON.stringify({ type: 'join', playerId: 'other' }));
  socket.receive('not JSON');
  socket.receive(new ArrayBuffer(2));

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith({ type: 'join', playerId: 'other' });

  unsubscribe();
  socket.receive(JSON.stringify({ type: 'leave', playerId: 'other' }));
  expect(listener).toHaveBeenCalledTimes(1);
});

test('it creates a WebSocket for a URL, and a player id', () => {
  vi.stubGlobal('WebSocket', FakeWebSocket);

  try {
    const connection = createWebSocketConnection('ws://host/room');

    expect(connection.socket).toBeInstanceOf(FakeWebSocket);
    expect((connection.socket as unknown as FakeWebSocket).url).toBe(
      'ws://host/room',
    );
    expect(connection.playerId).not.toBe('');
  } finally {
    vi.unstubAllGlobals();
  }
});
