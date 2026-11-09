import {
  createWebSocketConnection,
  MyCrossword,
  type WebSocketConnection,
} from 'mycrossword';
import data28505 from './examples/guardian.cryptic.28505';
import data25220 from './examples/guardian.prize.25220';
import dataMini from './examples/mini';
import dataBarred from './examples/barred';
import { useEffect, useState } from 'react';
import './App.css';

const ALLOWED_HTML_TAGS = ['b', 'strong', 'i', 'em', 'sub', 'sup'];

const THEME_OPTIONS = [
  'red',
  'pink',
  'purple',
  'deepPurple',
  'indigo',
  'blue',
  'lightBlue',
  'cyan',
  'teal',
  'green',
  'deepOrange',
  'blueGrey',
] as const;

const crosswords = [
  {
    id: '28505',
    name: 'Guardian Cryptic 28,505',
    data: data28505,
  },
  {
    id: '25220',
    name: 'Guardian Prize 25,220',
    data: data25220,
  },
  {
    id: 'mini',
    name: 'Mini crossword No 1',
    data: dataMini,
  },
  {
    id: 'barred',
    name: 'Barred crossword No 1',
    data: dataBarred,
  },
] as const;

type CrosswordId = (typeof crosswords)[number]['id'];

type Theme = (typeof THEME_OPTIONS)[number];

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

/**
 * Connects to a room on the dev server's multiplayer host (see
 * src/server/multiplayerServer.ts). Each crossword has its own rooms.
 */
function connectToRoom(crosswordId: CrosswordId, room: string) {
  const url = new URL('/multiplayer', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('room', `${crosswordId}/${room}`);

  return createWebSocketConnection(url);
}

/** The connection's status, updated as it opens and closes. */
function useConnectionStatus(connection: WebSocketConnection | null) {
  const [status, setStatus] = useState<{
    connection: WebSocketConnection;
    status: ConnectionStatus;
  } | null>(null);

  useEffect(() => {
    if (connection === null) {
      return;
    }

    const { socket } = connection;
    const handleOpen = () => setStatus({ connection, status: 'connected' });
    const handleClose = () => setStatus({ connection, status: 'disconnected' });

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('close', handleClose);

    return () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('close', handleClose);
      connection.close();
    };
  }, [connection]);

  if (connection === null) {
    return null;
  }

  return status?.connection === connection ? status.status : 'connecting';
}

function App() {
  const [theme, setTheme] = useState<Theme>('blue');
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [complete, setComplete] = useState(false);
  const [selectedCrosswordId, setSelectedCrosswordId] =
    useState<CrosswordId>('28505');
  const [room, setRoom] = useState(
    () => new URLSearchParams(window.location.search).get('room') ?? '',
  );
  const [connection, setConnection] = useState<WebSocketConnection | null>(
    null,
  );
  const connectionStatus = useConnectionStatus(connection);

  const selectedCrossword = crosswords.find(
    (crossword) => crossword.id === selectedCrosswordId,
  );

  if (selectedCrossword === undefined) {
    throw new Error(`Crossword with id ${selectedCrosswordId} not found.`);
  }

  const handleCrosswordChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const crosswordId = event.target.value as CrosswordId;
    setSelectedCrosswordId(crosswordId);
    setComplete(false);

    // join the same room for the new crossword
    if (connection !== null) {
      setConnection(connectToRoom(crosswordId, room.trim()));
    }
  };

  const handleRoomSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (connection !== null) {
      setConnection(null);
    } else if (room.trim() !== '') {
      setConnection(connectToRoom(selectedCrosswordId, room.trim()));
    }
  };

  return (
    <div className="Page">
      <div className="Page__banner">
        <h3>MyCrossword</h3>
      </div>
      <main className="Page__main">
        <div className="Page__controls">
          <div className="Page__control">
            <label htmlFor="crossword-selector">Crossword</label>
            <select
              id="crossword-selector"
              onChange={handleCrosswordChange}
              value={selectedCrosswordId}
            >
              {crosswords.map((crossword) => (
                <option key={crossword.id} value={crossword.id}>
                  {crossword.name}
                </option>
              ))}
            </select>
          </div>
          <div className="Page__control">
            <label htmlFor="theme-selector">Theme</label>
            <select
              id="theme-selector"
              onChange={(event) => setTheme(event.target.value as Theme)}
              value={theme}
            >
              {THEME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="Page__control">
            <label htmlFor="def-selector">Show definitions</label>
            <input
              checked={showDefinitions}
              id="def-selector"
              onChange={(event) => setShowDefinitions(event.target.checked)}
              type="checkbox"
            />
          </div>
          <form className="Page__control" onSubmit={handleRoomSubmit}>
            <label htmlFor="room-input">Room</label>
            <input
              disabled={connection !== null}
              id="room-input"
              onChange={(event) => setRoom(event.target.value)}
              placeholder="Solve together"
              size={14}
              value={room}
            />
            <button disabled={connection === null && room.trim() === ''}>
              {connection !== null ? 'Leave' : 'Join'}
            </button>
            {connectionStatus !== null ? (
              <span className="Page__status">{connectionStatus}</span>
            ) : null}
          </form>
          {complete ? (
            <div className="Page__alert">
              <div className="Page__alertIcon">
                <span>✔</span>
              </div>
              <span>Complete</span>
            </div>
          ) : null}
        </div>
        <MyCrossword
          allowedHtmlTags={
            showDefinitions ? ['u', ...ALLOWED_HTML_TAGS] : ALLOWED_HTML_TAGS
          }
          cellSize={
            selectedCrosswordId === 'mini' || selectedCrosswordId === 'barred'
              ? 50
              : 31
          }
          id={`example.${selectedCrosswordId}`}
          multiplayer={connection ?? undefined}
          intro={{
            node: <span className="Page__advert">advertisement</span>,
            countdown: { seconds: 3 },
          }}
          data={selectedCrossword.data}
          onComplete={() => setComplete(true)}
          theme={theme}
          urlHash
        />
      </main>
    </div>
  );
}

export default App;
