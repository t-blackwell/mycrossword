import useBreakpoint from './useBreakpoint';
import { act, renderHook } from '@testing-library/react';

test('it should be defined', () => {
  expect(useBreakpoint).toBeDefined();
});

test('should handle xs breakpoint', async () => {
  act(() => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
  });
  const { result } = renderHook(() => useBreakpoint());
  expect(result.current).toBe('xs');
});

test('should handle sm breakpoint', async () => {
  act(() => {
    window.innerWidth = 700;
    window.dispatchEvent(new Event('resize'));
  });
  const { result } = renderHook(() => useBreakpoint());
  expect(result.current).toBe('sm');
});

test('should handle md breakpoint', async () => {
  act(() => {
    window.innerWidth = 900;
    window.dispatchEvent(new Event('resize'));
  });
  const { result } = renderHook(() => useBreakpoint());
  expect(result.current).toBe('md');
});

test('should handle lg breakpoint', async () => {
  act(() => {
    window.innerWidth = 1100;
    window.dispatchEvent(new Event('resize'));
  });
  const { result } = renderHook(() => useBreakpoint());
  expect(result.current).toBe('lg');
});

test('should handle xl breakpoint', async () => {
  act(() => {
    window.innerWidth = 1300;
    window.dispatchEvent(new Event('resize'));
  });
  const { result } = renderHook(() => useBreakpoint());
  expect(result.current).toBe('xl');
});

test('should handle xxl breakpoint', async () => {
  act(() => {
    window.innerWidth = 2000;
    window.dispatchEvent(new Event('resize'));
  });
  const { result } = renderHook(() => useBreakpoint());
  expect(result.current).toBe('xxl');
});

test('should handle breakpoint on a boundary', async () => {
  act(() => {
    window.innerWidth = 576;
    window.dispatchEvent(new Event('resize'));
  });
  const { result } = renderHook(() => useBreakpoint());
  expect(result.current).toBe('sm');
});
