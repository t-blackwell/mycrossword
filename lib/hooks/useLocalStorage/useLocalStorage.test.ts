import { act, renderHook } from '@testing-library/react';
import useLocalStorage from './useLocalStorage';

const key = 'test-storage';
const initialState = { a: 1, b: 2 };

test('it should be defined', () => {
  expect(useLocalStorage).toBeDefined();
});

test('it returns initialState', () => {
  const { result } = renderHook(() => useLocalStorage(key, initialState));
  expect(result.current[0]).toEqual(initialState);
});

test('it updates value', () => {
  const { result } = renderHook(() => useLocalStorage(key, initialState));
  expect(localStorage.getItem(key)).toBeNull();

  const newValue = { a: 2, b: 5 };
  act(() => {
    result.current[1](newValue);
  });

  expect(result.current[0]).toEqual(newValue);
  expect(localStorage.getItem(key)).toEqual(JSON.stringify(newValue));
});
