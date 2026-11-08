import * as React from 'react';
import Button from '../Button/Button';
import { getBem } from '~/utils/bem';
import { useEventCallback } from '~/hooks/useEventCallback/useEventCallback';
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
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const timeoutId = React.useId();

  // the control that opened this has been replaced, so move focus here
  // (to the least destructive option)
  React.useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // a stable reference to the latest onCancel, so the countdown isn't
  // restarted whenever the parent re-renders with a new function
  const cancel = useEventCallback(onCancel);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (seconds <= 1) {
        cancel();
      } else {
        setSeconds((secs) => secs - 1);
      }
    }, 1000);

    return function cleanup() {
      clearTimeout(timer);
    };
  }, [seconds, cancel]);

  return (
    <div
      aria-describedby={timeoutId}
      aria-label={buttonText}
      className={bem('Confirm')}
      role="group"
    >
      <div className={bem('Confirm__buttonContainer')}>
        <Button onClick={onCancel} ref={cancelRef} variant="outlined">
          Cancel
        </Button>
        <Button className={bem('Confirm__button')} onClick={onConfirm}>
          {buttonText}
        </Button>
      </div>
      <span className={bem('Confirm__timeout')} id={timeoutId}>
        This will automatically cancel in {seconds}
      </span>
    </div>
  );
}
