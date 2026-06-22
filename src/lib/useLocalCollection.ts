import { useMemo, useState } from 'react';

type WithId = { id: string };

export function useLocalCollection<T extends WithId>(seed: T[]) {
  const [items, setItems] = useState(seed);

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
