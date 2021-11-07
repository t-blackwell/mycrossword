import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MyCrossword, MyCrosswordProps } from 'components';

export default function App(props: MyCrosswordProps): JSX.Element {
  return (
    <React.StrictMode>
      <MyCrossword {...props}/>;
    </React.StrictMode>
  )
}