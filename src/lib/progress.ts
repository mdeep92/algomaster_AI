import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'algomaster:completed-topics';

/**
 * Tracks which topics the user has marked complete. Backed by localStorage so
 * progress survives reloads and stays in sync across the Dashboard, Curriculum,
 * and TopicDetail screens.
 */
export function useCompletedTopics() {
  const [completed, setCompleted] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const isCompleted = useCallback((id: string) => completed.includes(id), [completed]);

  const toggle = useCallback(
    (id: string) =>
      setCompleted((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    [setCompleted],
  );

  return { completed, isCompleted, toggle };
}
