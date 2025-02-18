import { act, renderHook } from '@testing-library/react';
import useDebounce from './useDebounce';

test('it should be defined', () => {
  expect(useDebounce).toBeDefined();
});

test('it updates value after delay', () => {
  jest.useFakeTimers();

  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 100),
    { initialProps: { value: 'one' } },
  );
  expect(result.current).toBe('one');

  act(() => {
    jest.advanceTimersByTime(50);
  });
  expect(result.current).toBe('one');

  rerender({ value: 'two' });
  rerender({ value: 'three' });
  expect(result.current).toBe('one');

  act(() => {
    jest.advanceTimersByTime(100);
  });
  expect(result.current).toBe('three');

  jest.useRealTimers();
});
