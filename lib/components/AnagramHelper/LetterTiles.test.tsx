import { render, screen } from '@testing-library/react';
import LetterTiles from './LetterTiles';

test('it renders a tile per letter, in typed order', () => {
  const { container } = render(
    <LetterTiles
      letters="abcd"
      order={[2, 0, 3, 1]}
      usedLetters=""
    />,
  );

  const tiles = container.querySelectorAll('.LetterTiles__tile');
  expect([...tiles].map((tile) => tile.textContent)).toEqual([
    'A',
    'B',
    'C',
    'D',
  ]);

  // the board is labelled in arranged order
  screen.getByRole('group', { name: 'Letter tiles: C A D B' });
});

test('it staggers the bounce by arranged position', () => {
  render(
    <LetterTiles
      letters="ab"
      order={[1, 0]}
      usedLetters=""
    />,
  );

  expect(screen.getByText('A').parentElement?.style.transitionDelay).toBe(
    '8ms',
  );
  expect(screen.getByText('B').parentElement?.style.transitionDelay).toBe(
    '0ms',
  );
});

test('it fades used letters', () => {
  render(
    <LetterTiles
      letters="abcae"
      order={[0, 1, 2, 3, 4]}
      usedLetters="DA"
    />,
  );

  const [firstA, secondA] = screen.getAllByText('A');
  expect(firstA.parentElement).toHaveClass('LetterTiles__tile--used');
  expect(secondA.parentElement).not.toHaveClass(
    'LetterTiles__tile--used',
  );
  expect(screen.getByText('B').parentElement).not.toHaveClass(
    'LetterTiles__tile--used',
  );
});
