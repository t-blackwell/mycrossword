import React from 'react';
import MyCrossword from 'mycrossword'
import data from './test.valid.1';

const App = () => {
  return (
    <div>
      <MyCrossword id={data.id} data={data} />
    </div>
  );
};

export default App