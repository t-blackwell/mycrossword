import { CellPosition } from 'interfaces';
import * as React from 'react';
import testData from 'testData/test.valid.1';
import { restoreConsoleError, suppressConsoleError } from 'utils/jest';
import { render, store } from 'utils/rtl';
import { initialiseStore } from 'utils/test';
import GridCell, { cellSize, getDimensions } from './GridCell';

const cellPos: CellPosition = { col: 0, row: 0 };

beforeEach(() => {
  initialiseStore(store, testData);
});

test('it renders', () => {
  const { container } = render(
    <svg>
      <GridCell
        clueIds={['1-across']}
        isHighlighted={false}
        isSelected={false}
        pos={cellPos}
        selectedClueIndex={-1}
      />
    </svg>,
  );

  const { xRect, yRect, xText, yText } = getDimensions(cellPos);

  const groups = container.querySelectorAll('g');
  expect(groups.length).toBe(1);
  expect(groups[0]).not.toHaveClass('GridCell--highlighted');
  expect(groups[0]).not.toHaveClass('GridCell--selected');

  const rects = container.querySelectorAll('rect');
  expect(rects.length).toBe(1);
  expect(rects[0]).toHaveAttribute('x', xRect.toString());
  expect(rects[0]).toHaveAttribute('y', yRect.toString());
  expect(rects[0]).toHaveAttribute('width', cellSize.toString());
  expect(rects[0]).toHaveAttribute('height', cellSize.toString());

  const text = container.querySelectorAll('text');
  expect(text.length).toBe(1);
  expect(text[0].textContent).toBe('');
  expect(text[0]).toHaveAttribute('x', xText.toString());
  expect(text[0]).toHaveAttribute('y', yText.toString());
});

test('it renders with num', () => {
  const { container } = render(
    <svg>
      <GridCell
        clueIds={['1-across']}
        isHighlighted={false}
        isSelected={false}
        num={1}
        pos={cellPos}
        selectedClueIndex={-1}
      />
    </svg>,
  );

  const { xNum, yNum, xText, yText } = getDimensions(cellPos);

  const text = container.querySelectorAll('text');
  expect(text.length).toBe(2);

  expect(text[0]).toHaveAttribute('x', xNum.toString());
  expect(text[0]).toHaveAttribute('y', yNum.toString());
  expect(text[0].textContent).toBe('1');

  expect(text[1]).toHaveAttribute('x', xText.toString());
  expect(text[1]).toHaveAttribute('y', yText.toString());
  expect(text[1].textContent).toBe('');
});

test('it renders with guess', () => {
  const guess = 'X';
  const { container } = render(
    <svg>
      <GridCell
        clueIds={['1-across']}
        isHighlighted={false}
        isSelected={false}
        pos={cellPos}
        selectedClueIndex={-1}
        guess={guess}
      />
    </svg>,
  );

  const text = container.querySelectorAll('text');
  expect(text.length).toBe(1);
  expect(text[0].textContent).toBe(guess);
});

test('it renders highlighted', () => {
  const { container } = render(
    <svg>
      <GridCell
        clueIds={['1-across']}
        isHighlighted
        isSelected={false}
        pos={cellPos}
        selectedClueIndex={-1}
      />
    </svg>,
  );

  const groups = container.querySelectorAll('g');
  expect(groups.length).toBe(1);
  expect(groups[0]).toHaveClass('GridCell--highlighted');
  expect(groups[0]).not.toHaveClass('GridCell--selected');
});

test('it renders selected', () => {
  const { container } = render(
    <svg>
      <GridCell
        clueIds={['1-across']}
        isHighlighted={false}
        isSelected
        pos={cellPos}
        selectedClueIndex={-1}
      />
    </svg>,
  );

  const groups = container.querySelectorAll('g');
  expect(groups.length).toBe(1);
  expect(groups[0]).not.toHaveClass('GridCell--highlighted');
  expect(groups[0]).toHaveClass('GridCell--selected');
});

test('it throws with 0 clueIds', () => {
  suppressConsoleError();

  expect(() =>
    render(
      <svg>
        <GridCell
          clueIds={[]}
          isHighlighted={false}
          isSelected
          pos={cellPos}
          selectedClueIndex={-1}
        />
      </svg>,
    ),
  ).toThrow();

  restoreConsoleError();
});

test('it throws with more than 2 clueIds', () => {
  suppressConsoleError();

  expect(() =>
    render(
      <svg>
        <GridCell
          clueIds={['1-across', '1-down', 'something-else']}
          isHighlighted={false}
          isSelected
          pos={cellPos}
          selectedClueIndex={-1}
        />
      </svg>,
    ),
  ).toThrow();

  restoreConsoleError();
});

test('it gets correct dimensions', () => {
  const { xRect, yRect, xNum, yNum, xText, yText } = getDimensions({
    col: 0,
    row: 0,
  });

  expect(xRect).toBe(1);
  expect(yRect).toBe(1);
  expect(xNum).toBe(2);
  expect(yNum).toBe(10);
  expect(xText).toBe(16.5);
  expect(yText).toBe(21.925);

  const {
    xRect: xRect2,
    yRect: yRect2,
    xNum: xNum2,
    yNum: yNum2,
    xText: xText2,
    yText: yText2,
  } = getDimensions({
    col: 6,
    row: 1,
  });

  expect(xRect2).toBe(193);
  expect(yRect2).toBe(33);
  expect(xNum2).toBe(194);
  expect(yNum2).toBe(42);
  expect(xText2).toBe(208.5);
  expect(yText2).toBe(53.925);
});
