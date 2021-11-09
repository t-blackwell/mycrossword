import classNames from 'classnames';
import * as React from 'react';

interface SpinnerProps {
  size: 'small' | 'standard' | 'large';
}

export default function Spinner({ size }: SpinnerProps): JSX.Element {
  return (
    <div className={classNames('Spinner', `Spinner--${size}`)} role="status" />
  );
}
