import { useState, useEffect } from "react";

/**
 * A hook that returns a debounced version of the provided value.
 * * @param value The value to debounce
 * @param delay The delay in milliseconds (defaults to 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
