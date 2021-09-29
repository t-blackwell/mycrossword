import classNames from 'classnames';
import * as React from 'react';
import './WordWheel.scss';

const round = (val: number) => Math.round(val * 100) / 100;

const getPosition = (diameter: number, angle: number, i: number) => {
  const theta = ((angle * Math.PI) / 180) * i;

  return {
    left: `${diameter + round(diameter * Math.sin(theta))}%`,
    top: `${diameter + round(diameter * Math.cos(theta))}%`,
  };
};

const getAngle = (letters: string, minForCentral: number = 5) => {
  if (letters.length === 0) {
    return 0;
  }

  if (letters.length < minForCentral) {
    return 360 / letters.length;
  }

  return 360 / (letters.length - 1);
};

interface WordWheelProps {
  letters: string;
}

export default function WordWheel({ letters }: WordWheelProps): JSX.Element {
  const angle = getAngle(letters);
  const diameter = 40;

  return (
    <div className="WordWheel">
      {letters.split('').map((letter, i) => (
        <span
          className={classNames(
            'WordWheel__letter',
            i === 0 && (letters.length === 1 || letters.length > 4)
              ? 'WordWheel__letter--central'
              : null,
          )}
          style={
            i === 0 && (letters.length === 1 || letters.length > 4)
              ? {
                  left: `${diameter - 1}%`,
                  top: `${diameter - 2}%`,
                }
              : getPosition(diameter, angle, i)
          }
          // eslint-disable-next-line react/no-array-index-key
          key={`${letter}-${i}`}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}
