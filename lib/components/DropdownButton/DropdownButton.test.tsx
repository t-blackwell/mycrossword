// eslint-disable-next-line @typescript-eslint/no-redeclare
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { restoreConsoleMessage, suppressConsoleMessage } from '~/utils/jest';
import DropdownButton, { DropdownMenuItem } from './DropdownButton';

// TODO: check menu items are shown/hidden rather than using the button `aria-expanded` attribute
// need to find out why `expect(menuUl).toBeVisible()` doesn't work

const menu: DropdownMenuItem[] = [
  { onClick: () => jest.fn(), text: 'One' },
  { onClick: () => jest.fn(), text: 'Two' },
  { disabled: true, onClick: () => jest.fn(), text: 'Three' },
];

test('it renders', () => {
  render(<DropdownButton id="test" menu={menu} text="Test" />);
  const button = screen.getByRole('button', { name: 'Test' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('it expands menu', async () => {
  render(<DropdownButton menu={menu} text="Test" />);
  const button = screen.getByRole('button', { name: 'Test' });
  await userEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
});

test('it closes menu on second button click', async () => {
  render(<DropdownButton menu={menu} text="Test" />);
  const button = screen.getByRole('button', { name: 'Test' });
  expect(button).toHaveAttribute('aria-expanded', 'false');

  await userEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');

  await userEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('it closes menu on outside click', async () => {
  render(<DropdownButton menu={menu} text="Test" />);
  const button = screen.getByRole('button', { name: 'Test' });
  await userEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');

  await userEvent.click(document.body);
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('it throws when less than two menu items', () => {
  suppressConsoleMessage('error');

  expect(() => render(<DropdownButton menu={[]} text="Test" />)).toThrow();
  expect(() =>
    render(
      <DropdownButton
        menu={[{ onClick: () => jest.fn(), text: 'Only one' }]}
        text="Test"
      />,
    ),
  ).toThrow();

  restoreConsoleMessage('error');
});
