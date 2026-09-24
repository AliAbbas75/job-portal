import { getReferenceData } from '../api/reference';
import { useAsync } from './useAsync';

let cached = null;

/** Lookup lists (departments, provinces, ...), fetched once per page load. */
export function useReferenceData() {
  return useAsync(() => {
    cached ??= getReferenceData();
    return cached;
  }, []);
}
