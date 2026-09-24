import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async loader and tracks { data, error, loading }.
 * `deps` (primitives only) work like useEffect deps. While a new request runs, the previous
 * data stays available. Call `reload()` to fetch again, or `setData` after a save.
 */
export function useAsync(loader, deps) {
  const [version, setVersion] = useState(0);
  const requestKey = JSON.stringify([...deps, version]);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((data) => !cancelled && setResult({ key: requestKey, data, error: null }))
      .catch((error) => !cancelled && setResult({ key: requestKey, data: null, error }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- requestKey captures the caller's deps
  }, [requestKey]);

  const loading = result.key !== requestKey;
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback(
    (data) => setResult({ key: requestKey, data, error: null }),
    [requestKey],
  );

  return { data: result.data, error: loading ? null : result.error, loading, reload, setData };
}
