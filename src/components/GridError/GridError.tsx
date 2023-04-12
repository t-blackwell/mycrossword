import * as React from 'react';

interface GridErrorProps {
  message: string;
}

export default function GridError({ message }: GridErrorProps) {
  return (
    <div className="GridError">
      <div role="alert">
        <h1 className="GridError__title">Something went wrong</h1>
        <p className="GridError__subTitle">{message}</p>
      </div>
    </div>
  );
}
