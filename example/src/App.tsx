import MyCrossword from 'mycrossword';
import 'mycrossword/dist/index.css';
import React from 'react';
import './App.css';
import data from './guardian.cryptic.28505';

const App = () => {
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
        <MyCrossword id={data.id} data={data} />
      </main>
    </>
  );
};

export default App;
