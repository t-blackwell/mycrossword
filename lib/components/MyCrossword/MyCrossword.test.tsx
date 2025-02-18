import { render } from '@testing-library/react';
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
