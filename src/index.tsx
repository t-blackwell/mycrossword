import * as React from 'react';
import { MyCrossword, MyCrosswordProps } from './components';

export type { GuardianCrossword } from './interfaces';

export default function App(props: MyCrosswordProps): JSX.Element {
  return (
    <React.StrictMode>
      <MyCrossword {...props} />
    </React.StrictMode>
  );
}
