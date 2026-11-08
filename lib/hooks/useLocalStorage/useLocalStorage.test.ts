import { act, renderHook } from '@testing-library/react';
import { restoreConsoleMessage, suppressConsoleMessage } from '~/utils/test';
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

test('it reads an existing value', () => {
  localStorage.setItem(key, JSON.stringify({ a: 3, b: 4 }));

  const { result } = renderHook(() => useLocalStorage(key, initialState));
  expect(result.current[0]).toEqual({ a: 3, b: 4 });
});

test('it accepts a function as the initial value', () => {
  const { result } = renderHook(() => useLocalStorage(key, () => initialState));
  expect(result.current[0]).toEqual(initialState);
});

test('it updates value with a function', () => {
  const { result } = renderHook(() => useLocalStorage(key, initialState));

  act(() => {
    result.current[1]((value) => ({ ...value, b: value.b + 1 }));
  });

  expect(result.current[0]).toEqual({ a: 1, b: 3 });
  expect(localStorage.getItem(key)).toEqual(JSON.stringify({ a: 1, b: 3 }));
});

test('it returns the initial value when the stored value is invalid JSON', () => {
  suppressConsoleMessage('error');
  localStorage.setItem(key, '{ not json');

  const { result } = renderHook(() => useLocalStorage(key, initialState));
  expect(result.current[0]).toEqual(initialState);
  expect(console.error).toHaveBeenCalled();

  restoreConsoleMessage('error');
});

test('it supports a stored value of undefined', () => {
  localStorage.setItem(key, 'undefined');

  const { result } = renderHook(() => useLocalStorage(key, initialState));
  expect(result.current[0]).toBeUndefined();
});

test('it uses a custom serializer and deserializer', () => {
  const options = {
    serializer: (value: number) => `#${value}`,
    deserializer: (value: string) => Number(value.slice(1)),
  };
  localStorage.setItem(key, '#5');

  const { result } = renderHook(() => useLocalStorage(key, 0, options));
  expect(result.current[0]).toBe(5);

  act(() => {
    result.current[1](6);
  });
  expect(localStorage.getItem(key)).toBe('#6');
});

test('it removes the value', () => {
  const { result } = renderHook(() => useLocalStorage(key, initialState));

  act(() => {
    result.current[1]({ a: 9, b: 9 });
  });
  act(() => {
    result.current[2]();
  });

  expect(result.current[0]).toEqual(initialState);
  expect(localStorage.getItem(key)).toBeNull();
});

test('it keeps hooks using the same key in sync', () => {
  const { result: first } = renderHook(() =>
    useLocalStorage(key, initialState),
  );
  const { result: second } = renderHook(() =>
    useLocalStorage(key, initialState),
  );
  const { result: other } = renderHook(() =>
    useLocalStorage('other-key', initialState),
  );

  act(() => {
    first.current[1]({ a: 7, b: 8 });
  });

  expect(second.current[0]).toEqual({ a: 7, b: 8 });
  expect(other.current[0]).toEqual(initialState);
});

test('it updates when the value is changed in another tab', () => {
  const { result } = renderHook(() => useLocalStorage(key, initialState));

  act(() => {
    localStorage.setItem(key, JSON.stringify({ a: 5, b: 6 }));
    window.dispatchEvent(new StorageEvent('storage', { key }));
  });

  expect(result.current[0]).toEqual({ a: 5, b: 6 });
});

test('it reads the new value when the key changes', () => {
  localStorage.setItem('key-1', JSON.stringify('one'));
  localStorage.setItem('key-2', JSON.stringify('two'));

  const { result, rerender } = renderHook(
    ({ storageKey }) => useLocalStorage(storageKey, ''),
    { initialProps: { storageKey: 'key-1' } },
  );
  expect(result.current[0]).toBe('one');

  rerender({ storageKey: 'key-2' });
  expect(result.current[0]).toBe('two');
});

test('it keeps the current value if local storage is unavailable', () => {
  suppressConsoleMessage('warn');
  const setItem = vi
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

  const { result } = renderHook(() => useLocalStorage(key, initialState));

  act(() => {
    result.current[1]({ a: 2, b: 2 });
  });

  expect(result.current[0]).toEqual(initialState);
  expect(console.warn).toHaveBeenCalled();

  setItem.mockRestore();
  restoreConsoleMessage('warn');
});
