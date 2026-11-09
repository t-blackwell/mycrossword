import type { Plugin } from 'vite';
import { WebSocketServer } from 'ws';
import { createMultiplayerHost } from '../../lib/host.ts';

/** The path the demo app's players connect to, e.g. `/multiplayer?room=1`. */
export const MULTIPLAYER_PATH = '/multiplayer';

/**
 * Hosts crosswords solved together in the demo app, using the library's
 * multiplayer host over WebSockets on the dev server.
 */
export function multiplayerServer(): Plugin {
  return {
    name: 'mycrossword:multiplayer-server',
    apply: 'serve',
    configureServer(server) {
      const httpServer = server.httpServer;

      if (httpServer === null) {
        return;
      }

      const host = createMultiplayerHost();
      const wss = new WebSocketServer({
        noServer: true,
        maxPayload: 64 * 1024,
      });

      // the dev server's own (HMR) WebSocket is left to Vite
      httpServer.on('upgrade', (request, socket, head) => {
        const url = new URL(request.url ?? '', 'http://localhost');

        if (url.pathname !== MULTIPLAYER_PATH) {
          return;
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
          const connection = host.connect(
            ws,
            url.searchParams.get('room') ?? '',
          );

          ws.on('message', (data, isBinary) => {
            if (!isBinary) {
              connection.receive(data.toString());
            }
          });
          ws.on('close', () => connection.close());
        });
      });

      httpServer.on('close', () => wss.close());
    },
  };
}
