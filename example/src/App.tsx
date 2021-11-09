import MyCrossword from 'mycrossword';
import 'mycrossword/dist/index.css';
import React from 'react';
import data from './test.valid.1';

const App = () => {
  return <MyCrossword id={data.id} data={data} />;
};

export default App;
