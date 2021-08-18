import { MyCrossword } from 'components';
import * as React from 'react';
import data from './testData/guardian.cryptic.28505';

function App() {
  return <MyCrossword data={data} />;
}

export default App;
