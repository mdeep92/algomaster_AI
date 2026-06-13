import { useCallback, useEffect, useState } from 'react';

/**
 * State hook backed by localStorage. Reads the initial value once, writes on
 * every change, and stays in sync across other hook instances in the same tab
 * (via a custom event) and across tabs (via the native `storage` event).
 * All storage access is guarded so private-mode / quota errors degrade to
 * plain in-memory state instead of throwing.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const read = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = useState<T>(read);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
          // `storage` only fires in *other* tabs, so notify this tab explicitly.
          window.dispatchEvent(new CustomEvent('local-storage', { detail: key }));
        } catch {
          // ignore write failures (quota exceeded, private mode, etc.)
        }
        return resolved;
      });
    },
    [key],
  );

  useEffect(() => {
    const sync = () => setValue(read());
    const onCustom = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) sync();
    };
    window.addEventListener('storage', sync);
    window.addEventListener('local-storage', onCustom);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('local-storage', onCustom);
    };
  }, [key, read]);

  return [value, set] as const;
}
