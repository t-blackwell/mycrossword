import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import validData from '~/testData/test.valid.1';
import MyCrossword from './MyCrossword';

test('it renders', () => {
  const { container } = render(<MyCrossword data={validData} id="test" />);

  expect(container.firstChild).toHaveClass(
    'MyCrossword MyCrossword--blueTheme',
  );
});

test('it renders with different theme', () => {
  const { container } = render(
    <MyCrossword data={validData} id="test" theme="pink" />,
  );

  expect(container.firstChild).toHaveClass(
    'MyCrossword MyCrossword--pinkTheme',
  );
});

test('it shows the intro before the crossword', async () => {
  const { container } = render(
    <MyCrossword
      data={validData}
      id="test"
      intro={{ node: <p>Intro content</p>, continueLabel: 'Start' }}
    />,
  );

  screen.getByText('Intro content');
  expect(container.firstChild).toHaveClass('MyCrossword--showIntro');
  expect(screen.queryByText('Across')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Start' }));

  expect(screen.queryByText('Intro content')).not.toBeInTheDocument();
  expect(container.firstChild).not.toHaveClass('MyCrossword--showIntro');
  screen.getByText('Across');
});
