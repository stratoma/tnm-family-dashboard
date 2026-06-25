import { useEffect, useMemo, useState } from 'react';

type WithId = { id: string };
const storagePrefix = 'family-dashboard';

export function readStoredCollection<T>(key: string, seed: T[]) {
  if (typeof window === 'undefined') {
    return seed;
  }

  try {
    const stored = window.localStorage.getItem(`${storagePrefix}:${key}`);
    return stored ? (JSON.parse(stored) as T[]) : seed;
  } catch {
    return seed;
  }
}

export function useLocalCollection<T extends WithId>(seed: T[], storageKey?: string) {
  const [items, setItems] = useState(() => (storageKey ? readStoredCollection<T>(storageKey, seed) : seed));

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    window.localStorage.setItem(`${storagePrefix}:${storageKey}`, JSON.stringify(items));
  }, [items, storageKey]);

  const actions = useMemo(
    () => ({
      add(item: Omit<T, 'id'>) {
        setItems((current) => [{ ...item, id: crypto.randomUUID() } as T, ...current]);
      },
      update(id: string, next: Partial<T>) {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, ...next } : item)));
      },
      remove(id: string) {
        setItems((current) => current.filter((item) => item.id !== id));
      },
    }),
    [],
  );

  return { items, ...actions };
}
