import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import useBreakpoint from './useBreakpoint';

describe('useBreakpoint hook', () => {
  it('should handle xs breakpoint', async () => {
    act(() => {
      global.innerWidth = 500;
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('xs');
  });

  it('should handle sm breakpoint', async () => {
    act(() => {
      global.innerWidth = 700;
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('sm');
  });

  it('should handle md breakpoint', async () => {
    act(() => {
      global.innerWidth = 900;
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('md');
  });

  it('should handle lg breakpoint', async () => {
    act(() => {
      global.innerWidth = 1100;
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('lg');
  });

  it('should handle xl breakpoint', async () => {
    act(() => {
      global.innerWidth = 1300;
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('xl');
  });

  it('should handle xxl breakpoint', async () => {
    act(() => {
      global.innerWidth = 2000;
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('xxl');
  });

  it('should handle breakpoint on a boundary', async () => {
    act(() => {
      global.innerWidth = 576;
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('sm');
  });
});
