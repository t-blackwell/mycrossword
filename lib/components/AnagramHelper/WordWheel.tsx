import { getBem } from '~/utils/bem';
import './WordWheel.css';

const round = (val: number) => Math.round(val * 100) / 100;

const getPosition = (diameter: number, angle: number, i: number) => {
  const theta = ((angle * Math.PI) / 180) * i;

  return {
    left: `${diameter + round(diameter * Math.sin(theta))}%`,
    top: `${diameter + round(diameter * Math.cos(theta))}%`,
  };
};

const getCentralPosition = (diameter: number) => ({
  left: `${diameter - 1}%`,
  top: `${diameter - 2}%`,
});

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
  populatedLetters: string;
}

export default function WordWheel({
  letters,
  populatedLetters,
}: WordWheelProps) {
  const bem = getBem('WordWheel');
  const angle = getAngle(letters);
  const DIAMETER = 40;
  let populated = populatedLetters.toUpperCase();

  return (
    <div className={bem('WordWheel')}>
      {letters
        .toUpperCase()
        .split('')
        .map((letter, i) => {
          const isPopulated = populated.includes(letter);
          if (isPopulated) {
            populated = populated.replace(letter, '');
          }

          return (
            <span
              className={bem(
                'WordWheel__letter',
                i === 0 && (letters.length === 1 || letters.length > 4)
                  ? 'WordWheel__letter--central'
                  : null,
                isPopulated ? 'WordWheel__letter--populated' : null,
              )}
              style={
                i === 0 && (letters.length === 1 || letters.length > 4)
                  ? getCentralPosition(DIAMETER)
                  : getPosition(DIAMETER, angle, i)
              }
              key={`${letter}-${i}`}
            >
              {letter}
            </span>
          );
        })}
    </div>
  );
}
