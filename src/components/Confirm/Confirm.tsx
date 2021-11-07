import { Button } from '../../components';
import * as React from 'react';
import './Confirm.scss';

interface ConfirmProps {
  buttonText: string;
  onCancel: () => void;
  onConfirm: () => void;
  timeout?: number;
}

export const defaultTimeout = 5;

export default function Confirm({
  buttonText,
  onCancel,
  onConfirm,
  timeout = defaultTimeout,
}: ConfirmProps): JSX.Element {
  if (timeout <= 0) {
    throw new Error('Confirm should have a timeout greater than zero');
  }
  const [seconds, setSeconds] = React.useState(timeout);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (seconds <= 1) {
        onCancel();
      } else {
        setSeconds((secs) => secs - 1);
      }
    }, 1000);

    return function cleanup() {
      clearTimeout(timer);
    };
  }, [seconds]);

  return (
    <div className="Confirm">
      <div className="Confirm__buttonContainer">
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button className="Confirm__button" onClick={onConfirm}>
          {buttonText}
        </Button>
      </div>
      <span className="Confirm__timeout">
        This will automatically cancel in {seconds}
      </span>
    </div>
  );
}
