import { MyCrossword } from '../dist/main';
import '../dist/style.css';
import data from './examples/guardian.cryptic.28505';
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

type Theme = (typeof THEME_OPTIONS)[number];

function App() {
  const [theme, setTheme] = useState<Theme>('blue');
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [complete, setComplete] = useState(false);

  return (
    <div className="Page">
      <div className="Page__banner">
        <h3>MyCrossword</h3>
      </div>
      <main className="Page__main">
        <div className="Page__controls">
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
          id="example"
          data={data}
          onComplete={() => setComplete(true)}
          theme={theme}
        />
      </main>
    </div>
  );
}

export default App;
