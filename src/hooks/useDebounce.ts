/**
 * useDebounce Hook
 * Clean, minimal 15-line debouncing hook to prevent UI thrashing and TMDB rate-limiting during search.
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
