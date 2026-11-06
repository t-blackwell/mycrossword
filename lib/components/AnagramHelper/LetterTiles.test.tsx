import { render, screen } from '@testing-library/react';
import LetterTiles from './LetterTiles';

test('it renders a tile per letter, in typed order', () => {
  const { container } = render(
    <LetterTiles
      arrangement="wheel"
      letters="abcd"
      order={[2, 0, 3, 1]}
      populatedLetters=""
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
      arrangement="row"
      letters="ab"
      order={[1, 0]}
      populatedLetters=""
    />,
  );

  expect(screen.getByText('A').parentElement).toHaveStyle({
    transitionDelay: '8ms',
  });
  expect(screen.getByText('B').parentElement).toHaveStyle({
    transitionDelay: '0ms',
  });
});

test('it fades letters already in the grid', () => {
  render(
    <LetterTiles
      arrangement="wheel"
      letters="abcae"
      order={[0, 1, 2, 3, 4]}
      populatedLetters="DA"
    />,
  );

  const [firstA, secondA] = screen.getAllByText('A');
  expect(firstA.parentElement).toHaveClass('LetterTiles__tile--populated');
  expect(secondA.parentElement).not.toHaveClass(
    'LetterTiles__tile--populated',
  );
  expect(screen.getByText('B').parentElement).not.toHaveClass(
    'LetterTiles__tile--populated',
  );
});
