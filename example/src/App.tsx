import MyCrossword from 'mycrossword';
import 'mycrossword/dist/index.css';
import * as React from 'react';
import './App.css';
import data from './guardian.cryptic.28505';

// TODO: import from MyCrossword
const themeColors = [
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
type Theme = typeof themeColors[number];

export default function App() {
  const [theme, setTheme] = React.useState<Theme>('blue');

  return (
    <>
      <header>
        <span className="logo">MyCrossword</span>
        <span className="example">Example</span>
      </header>
      <main>
        <div className="crossword-title-container">
          <h1 className="crossword-title">{data.name}</h1>
          <span className="crossword-subtitle">
            {new Date(data.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {data.creator !== undefined
              ? `, set by ${data.creator.name}`
              : null}
          </span>
        </div>
        <div className="theme-selector">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
          >
            {themeColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
        <MyCrossword id={data.id} data={data} theme={theme} />
      </main>
    </>
  );
}
