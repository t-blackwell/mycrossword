import type { MultiplayerConnection, MultiplayerMessage } from '~/types';
import { createPlayerId } from './multiplayer';

// WebSocket.readyState values (not read from the global, which may be absent)
const CONNECTING = 0;
const OPEN = 1;

export interface WebSocketConnectionOptions {
  /** Identifies this player. Generated if not given. */
  playerId?: string;
}

export type WebSocketConnection = MultiplayerConnection & {
  playerId: string;
  /** Closes the WebSocket. */
  close: () => void;
  /** The WebSocket the messages are sent over. */
  socket: WebSocket;
};

/**
 * Creates a connection for solving a crossword with others, which sends and
 * receives the messages as JSON over a WebSocket. Pass it to `MyCrossword`'s
 * `multiplayer` prop.
 *
 * Messages sent while the WebSocket is connecting are sent once it opens, and
 * messages sent once it has closed are dropped. It doesn't reconnect: to
 * reconnect, create a new connection (the crossword rejoins when its
 * `multiplayer` prop changes).
 *
 * @param target - The URL of the host, or an existing WebSocket.
 */
export function createWebSocketConnection(
  target: string | URL | WebSocket,
  { playerId = createPlayerId() }: WebSocketConnectionOptions = {},
): WebSocketConnection {
  const socket =
    typeof target === 'string' || target instanceof URL
      ? new WebSocket(target)
      : target;
  const queue: string[] = [];

  socket.addEventListener('open', () => {
    while (queue.length > 0 && socket.readyState === OPEN) {
      socket.send(queue.shift()!);
    }
  });

  return {
    playerId,
    socket,
    close: () => socket.close(),
    send: (message: MultiplayerMessage) => {
      const data = JSON.stringify(message);

      if (socket.readyState === OPEN) {
        socket.send(data);
      } else if (socket.readyState === CONNECTING) {
        queue.push(data);
      }
    },
    subscribe: (listener) => {
      const handleMessage = (event: MessageEvent) => {
        if (typeof event.data !== 'string') {
          return;
        }

        let message: unknown;

        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }

        listener(message);
      };

      socket.addEventListener('message', handleMessage);

      return () => socket.removeEventListener('message', handleMessage);
    },
  };
}
