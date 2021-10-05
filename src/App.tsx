import { MyCrossword } from 'components';
import * as React from 'react';
import data from 'testData/test.valid.1';

function App() {
  return <MyCrossword id={data.id} data={data} />;
}

export default App;
