import * as React from 'react';
import Button from '../Button/Button';
import { getBem } from '~/utils/bem';
import './Confirm.css';

export const DEFAULT_TIMEOUT = 10;

interface ConfirmProps {
  buttonText: string;
  onCancel: () => void;
  onConfirm: () => void;
  timeout?: number;
}

export default function Confirm({
  buttonText,
  onCancel,
  onConfirm,
  timeout = DEFAULT_TIMEOUT,
}: ConfirmProps) {
  if (timeout <= 0) {
    throw new Error('Confirm should have a timeout greater than zero');
  }

  const bem = getBem('Confirm');
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
    <div className={bem('Confirm')}>
      <div className={bem('Confirm__buttonContainer')}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button className={bem('Confirm__button')} onClick={onConfirm}>
          {buttonText}
        </Button>
      </div>
      <span className={bem('Confirm__timeout')}>
        This will automatically cancel in {seconds}
      </span>
    </div>
  );
}
