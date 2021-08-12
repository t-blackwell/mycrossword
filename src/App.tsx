import { Crossword } from 'components';
import * as React from 'react';
import data from './testData/guardian.cryptic.28505';

function App() {
  return <Crossword data={data} />;
}

export default App;
