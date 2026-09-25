import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiResponseError, readJsonResponse } from './http';

type WithId = { id: string };
const storagePrefix = 'family-dashboard';
const accessCodeKey = 'family-dashboard-access-code';

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

export function writeStoredCollection<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(`${storagePrefix}:${key}`, JSON.stringify(items));
}

function hasStoredCollection(key: string) {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(`${storagePrefix}:${key}`) !== null;
}

export function useLocalCollection<T extends WithId>(seed: T[], storageKey?: string) {
  const [items, setItems] = useState(() => (storageKey ? readStoredCollection<T>(storageKey, seed) : seed));
  const [storageMode, setStorageMode] = useState<'browser' | 'database'>('browser');
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    writeStoredCollection(storageKey, items);
  }, [items, storageKey]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    let active = true;

    fetchCollection<T>(storageKey)
      .then(async (serverItems) => {
        if (!active) {
          return;
        }

        if (serverItems.length === 0 && hasStoredCollection(storageKey)) {
          const localItems = readStoredCollection<T>(storageKey, seed);
          if (localItems.length > 0) {
            const migratedItems = await Promise.all(
              localItems.map(async (item) => {
                const { id: _id, ...itemWithoutId } = item;
                return (await requestCollection<T>(storageKey, 'POST', null, itemWithoutId)) ?? item;
              }),
            );

            if (!active) {
              return;
            }

            setStorageMode('database');
            setStorageError(null);
            setItems(migratedItems);
            writeStoredCollection(storageKey, migratedItems);
            return;
          }
        }

        setStorageMode('database');
        setStorageError(null);
        setItems(serverItems);
        writeStoredCollection(storageKey, serverItems);
      })
      .catch((error: Error) => {
        if (!active) {
          return;
        }

        setStorageMode('browser');
        setStorageError(error.message);
      });

    return () => {
      active = false;
    };
  }, [seed, storageKey]);

  const persist = useCallback(
    async (method: 'POST' | 'PATCH' | 'DELETE', id: string | null, item?: Partial<T> | Omit<T, 'id'>) => {
      if (!storageKey) {
        return null;
      }

      try {
        const saved = await requestCollection<T>(storageKey, method, id, item);
        setStorageMode('database');
        setStorageError(null);
        return saved;
      } catch (error) {
        setStorageMode('browser');
        setStorageError(error instanceof Error ? error.message : 'Unable to save to database.');
        return null;
      }
    },
    [storageKey],
  );

  const actions = useMemo(
    () => ({
      add(item: Omit<T, 'id'>) {
        const temporaryItem = { ...item, id: crypto.randomUUID() } as T;
        setItems((current) => [temporaryItem, ...current]);
        void persist('POST', null, item).then((saved) => {
          if (!saved) {
            return;
          }

          setItems((current) => current.map((currentItem) => (currentItem.id === temporaryItem.id ? saved : currentItem)));
        });
      },
      update(id: string, next: Partial<T>) {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, ...next } : item)));
        void persist('PATCH', id, next).then((saved) => {
          if (!saved) {
            return;
          }

          setItems((current) => current.map((item) => (item.id === id ? saved : item)));
        });
      },
      remove(id: string) {
        setItems((current) => current.filter((item) => item.id !== id));
        void persist('DELETE', id);
      },
    }),
    [persist],
  );

  return { items, storageMode, storageError, ...actions };
}

async function fetchCollection<T>(key: string) {
  const response = await fetch(`/api/collections/${key}`, {
    headers: collectionHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const result = await readJsonResponse<{ items?: T[] }>(response);
  if (!result) {
    throw new Error(apiResponseError(response, 'Persistent storage returned an unexpected response.'));
  }

  return result.items ?? [];
}

async function requestCollection<T>(
  key: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  id: string | null,
  item?: Partial<T> | Omit<T, 'id'>,
) {
  const response = await fetch(`/api/collections/${key}${id ? `?id=${encodeURIComponent(id)}` : ''}`, {
    method,
    headers: {
      ...collectionHeaders(),
      'Content-Type': 'application/json',
    },
    body: item ? JSON.stringify(item) : undefined,
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  if (method === 'DELETE') {
    return null;
  }

  const result = await readJsonResponse<{ item?: T }>(response);
  if (!result) {
    throw new Error(apiResponseError(response, 'Persistent storage returned an unexpected response.'));
  }

  return result.item ?? null;
}

function collectionHeaders(): Record<string, string> {
  const accessCode = typeof window === 'undefined' ? '' : window.sessionStorage.getItem(accessCodeKey) ?? '';
  return accessCode ? { 'x-family-access-code': accessCode } : {};
}

async function readError(response: Response) {
  try {
    const result = await readJsonResponse<{ error?: string }>(response);
    return result?.error ?? apiResponseError(response, 'Persistent storage is unavailable.');
  } catch {
    return 'Persistent storage is unavailable.';
  }
}
