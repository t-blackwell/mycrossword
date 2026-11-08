import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { restoreConsoleMessage, suppressConsoleMessage } from '~/utils/test';
import DropdownButton, { DropdownMenuItem } from './DropdownButton';

// TODO: check menu items are shown/hidden rather than using the button `aria-expanded` attribute
// need to find out why `expect(menuUl).toBeVisible()` doesn't work

const menu: DropdownMenuItem[] = [
  { onClick: () => vi.fn(), text: 'One' },
  { onClick: () => vi.fn(), text: 'Two' },
  { disabled: true, onClick: () => vi.fn(), text: 'Three' },
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
        menu={[{ onClick: () => vi.fn(), text: 'Only one' }]}
        text="Test"
      />,
    ),
  ).toThrow();

  restoreConsoleMessage('error');
});

test('it is a disclosure button controlling a list of buttons', async () => {
  render(<DropdownButton id="test" menu={menu} text="Test" />);
  const button = screen.getByRole('button', { name: 'Test' });

  expect(button).not.toHaveAttribute('aria-haspopup');
  expect(button).toHaveAttribute('aria-controls', 'test-menu');
  expect(document.getElementById('test-menu')).toBeInTheDocument();
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Three' })).toBeDisabled();
});

test('Escape closes the menu and returns focus to the button', async () => {
  render(<DropdownButton menu={menu} text="Test" />);
  const button = screen.getByRole('button', { name: 'Test' });

  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
  expect(button).toHaveAttribute('aria-expanded', 'true');

  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'One' })).toHaveFocus();

  await userEvent.keyboard('{Escape}');
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(button).toHaveFocus();
});

test('it closes the menu when focus moves elsewhere', async () => {
  render(
    <>
      <DropdownButton menu={menu} text="Test" />
      <button type="button">Elsewhere</button>
    </>,
  );
  const button = screen.getByRole('button', { name: 'Test' });

  await userEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');

  // moving between the menu items keeps it open
  await userEvent.tab();
  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
  expect(button).toHaveAttribute('aria-expanded', 'true');

  // tabbing out (past the disabled item) closes it
  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
  expect(button).toHaveAttribute('aria-expanded', 'false');
});
