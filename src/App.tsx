import { MyCrossword } from '../dist/main';
import '../dist/style.css';
import data28505 from './examples/guardian.cryptic.28505';
import data25220 from './examples/guardian.prize.25220';
import dataMini from './examples/mini';
import { useState } from 'react';
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
] as const;

type CrosswordId = (typeof crosswords)[number]['id'];

type Theme = (typeof THEME_OPTIONS)[number];

function App() {
  const [theme, setTheme] = useState<Theme>('blue');
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [complete, setComplete] = useState(false);
  const [selectedCrosswordId, setSelectedCrosswordId] =
    useState<CrosswordId>('28505');

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
          cellSize={selectedCrosswordId === 'mini' ? 50 : 31}
          id={`example.${selectedCrosswordId}`}
          data={selectedCrossword.data}
          onComplete={() => setComplete(true)}
          theme={theme}
        />
      </main>
    </div>
  );
}

export default App;
