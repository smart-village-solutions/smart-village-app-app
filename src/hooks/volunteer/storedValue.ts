import { useCallback, useEffect, useState } from 'react';

// A failed secure-store read must not replace the last successful value with null.
export const useVolunteerStoredValue = <T>(load: () => Promise<T>) => {
  const [value, setValue] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    void Promise.resolve()
      .then(() => {
        if (!active) return;
        setLoading(true);
        setError(false);
        return load();
      })
      .then((result) => {
        if (active) setValue(() => result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load, attempt]);

  return { value, loading, error, retry };
};
