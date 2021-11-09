import MyCrossword from 'mycrossword';
import 'mycrossword/dist/index.css';
import React from 'react';
import data from './test.valid.1';

const App = () => {
  return (
    <div>
      <MyCrossword id={data.id} data={data} />
    </div>
  );
};

export default App;
