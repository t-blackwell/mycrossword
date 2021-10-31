import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MyCrossword, MyCrosswordProps } from 'components';

function App(props: MyCrosswordProps) {
  return (
    <React.StrictMode>
      <MyCrossword {...props}/>;
    </React.StrictMode>
  )
}

export default App;
