import { render, screen } from '@testing-library/react';
import WordWheel from './WordWheel';

// TODO: handle rounding display issues

test('it renders with 1 character', () => {
  render(<WordWheel letters="A" populatedLetters="" />);

  expect(screen.getByText('A')).toHaveStyle({ left: '39%', top: '38%' });
});

test('it renders with 2 characters', () => {
  render(<WordWheel letters="AB" populatedLetters="" />);

  expect(screen.getByText('A')).toHaveStyle({ left: '40%', top: '80%' });
  expect(screen.getByText('B')).toHaveStyle({ left: '40%', top: '0%' });
});

test('it renders with 3 characters', () => {
  render(<WordWheel letters="ABC" populatedLetters="" />);

  expect(screen.getByText('A')).toHaveStyle({ left: '40%', top: '80%' });
  expect(screen.getByText('B')).toHaveStyle({ left: '74.64%', top: '20%' });
  expect(screen.getByText('C')).toHaveStyle({
    left: '5.359999999999999%',
    top: '20%',
  });
});

test('it renders with 4 characters', () => {
  render(<WordWheel letters="ABCD" populatedLetters="" />);

  expect(screen.getByText('A')).toHaveStyle({ left: '40%', top: '80%' });
  expect(screen.getByText('B')).toHaveStyle({ left: '80%', top: '40%' });
  expect(screen.getByText('C')).toHaveStyle({ left: '40%', top: '0%' });
  expect(screen.getByText('D')).toHaveStyle({ left: '0%', top: '40%' });
});

test('it renders with 5 characters', () => {
  render(<WordWheel letters="ABCDE" populatedLetters="" />);

  expect(screen.getByText('A')).toHaveStyle({ left: '39%', top: '38%' });
  expect(screen.getByText('B')).toHaveStyle({ left: '80%', top: '40%' });
  expect(screen.getByText('C')).toHaveStyle({ left: '40%', top: '0%' });
  expect(screen.getByText('D')).toHaveStyle({ left: '0%', top: '40%' });
  expect(screen.getByText('E')).toHaveStyle({ left: '40%', top: '80%' });
});

test('it renders with 6 characters', () => {
  render(<WordWheel letters="ABCDEF" populatedLetters="" />);

  expect(screen.getByText('A')).toHaveStyle({ left: '39%', top: '38%' });
  expect(screen.getByText('B')).toHaveStyle({
    left: '78.03999999999999%',
    top: '52.36%',
  });
  expect(screen.getByText('C')).toHaveStyle({
    left: '63.510000000000005%',
    top: '7.640000000000001%',
  });
  expect(screen.getByText('D')).toHaveStyle({
    left: '16.49%',
    top: '7.640000000000001%',
  });
  expect(screen.getByText('E')).toHaveStyle({
    left: '1.9600000000000009%',
    top: '52.36%',
  });
  expect(screen.getByText('F')).toHaveStyle({ left: '40%', top: '80%' });
});

test('it renders with characters populated', () => {
  render(<WordWheel letters="ABCDE" populatedLetters="DA" />);

  const a = screen.getByText('A');
  expect(a).toHaveStyle({ left: '39%', top: '38%' });
  expect(a).toHaveClass('WordWheel__letter--populated');

  const b = screen.getByText('B');
  expect(b).toHaveStyle({ left: '80%', top: '40%' });
  expect(b).not.toHaveClass('WordWheel__letter--populated');

  const c = screen.getByText('C');
  expect(c).toHaveStyle({ left: '40%', top: '0%' });
  expect(c).not.toHaveClass('WordWheel__letter--populated');

  const d = screen.getByText('D');
  expect(d).toHaveStyle({ left: '0%', top: '40%' });
  expect(d).toHaveClass('WordWheel__letter--populated');

  const e = screen.getByText('E');
  expect(e).toHaveStyle({ left: '40%', top: '80%' });
  expect(e).not.toHaveClass('WordWheel__letter--populated');
});
