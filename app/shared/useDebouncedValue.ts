import { useEffect, useState } from "react";

/**
 * Întoarce `value` întârziat cu `delay` ms. Fiecare tastă nouă resetează timerul,
 * deci autocomplete-ul apelează rețeaua doar când userul se oprește din scris.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
