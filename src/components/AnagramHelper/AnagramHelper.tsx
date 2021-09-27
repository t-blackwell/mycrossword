import { Button, cellSize } from 'components';
import * as React from 'react';
import './AnagramHelper.scss';

interface CloseIconProps {
  className?: string;
}

function CloseIcon({ className }: CloseIconProps): JSX.Element {
  return (
    <svg className={className}>
      <g>
        <path d="M21 9.8l-.8-.8-5.2 4.8-5.2-4.8-.8.8 4.8 5.2-4.8 5.2.8.8 5.2-4.8 5.2 4.8.8-.8-4.8-5.2 4.8-5.2" />
      </g>
    </svg>
  );
}

interface AnagramHelperProps {
  clueNum: string;
  clueText: string;
  cols: number;
  onClose: () => void;
  rows: number;
  solutionLength: number;
}

export default function AnagramHelper({
  clueNum,
  clueText,
  cols,
  onClose,
  rows,
  solutionLength,
}: AnagramHelperProps): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [letters, setLetters] = React.useState('');
  const width = cols * cellSize + cols + 1;
  const height = rows * cellSize + rows + 1;

  const reset = () => {
    setLetters('');
    inputRef.current?.focus();
  };

  return (
    <div
      className="AnagramHelper"
      style={{ maxWidth: width, maxHeight: height, width, height }}
    >
      <Button
        ariaLabel="Close"
        className="AnagramHelper__closeButton"
        onClick={onClose}
        variant="outlined"
      >
        <CloseIcon className="AnagramHelper__closeButtonIcon" />
      </Button>
      <input
        className="AnagramHelper__input"
        maxLength={solutionLength}
        onChange={(event) => setLetters(event.target.value)}
        placeholder="Enter letters"
        ref={inputRef}
        spellCheck="false"
        value={letters}
      />
      <span className="AnagramHelper__counter">
        {letters.length}/{solutionLength}
      </span>
      <div className="AnagramHelper__buttons">
        <Button disabled={letters === ''} onClick={reset}>
          Start again
        </Button>
        <Button disabled={letters === ''} onClick={() => {}}>
          Shuffle
        </Button>
      </div>
      <p className="AnagramHelper__clue">
        <span className="AnagramHelper__clueNum">{clueNum}</span>
        {clueText}
      </p>
      {/* <em>squares go here</em> */}
    </div>
  );
}
