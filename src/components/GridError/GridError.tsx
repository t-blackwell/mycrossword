import * as React from 'react';
import './GridError.scss';

interface GridErrorProps {
  message: string;
}

export default function GridError({ message }: GridErrorProps): JSX.Element {
  return (
    <div className="GridError">
      <div role="alert">
        <h1 className="GridError__title">Something went wrong</h1>
        <p className="GridError__subTitle">{message}</p>
      </div>
    </div>
  );
}
