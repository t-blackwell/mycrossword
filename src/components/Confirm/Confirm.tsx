import * as React from 'react';
import './Confirm.css';

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
  timeout = 7,
}: ConfirmProps): JSX.Element {
  const [seconds, setSeconds] = React.useState(timeout);

  React.useEffect(() => {
    setTimeout(() => {
      if (seconds === 1) {
        onCancel();
      } else {
        setSeconds((secs) => secs - 1);
      }
    }, 1000);
  }, [seconds]);

  return (
    <div className="Confirm">
      <div className="Confirm__buttonContainer">
        <button
          className="Confirm__button Confirm__button--cancel"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="Confirm__button Confirm__button--confirm"
          onClick={onConfirm}
          type="button"
        >
          {buttonText}
        </button>
      </div>
      <span className="Confirm__timeout">
        This will automatically cancel in {seconds}
      </span>
    </div>
  );
}
