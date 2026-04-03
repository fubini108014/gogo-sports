import { useState, useEffect } from 'react';

/**
 * Returns a boolean indicating whether skeleton loading should be shown.
 * If externalLoading is provided, it takes precedence.
 * Otherwise, uses an internal timer to simulate loading.
 */
export function useSkeletonLoading(externalLoading?: boolean, delay = 500): boolean {
  const [internal, setInternal] = useState(true);

  useEffect(() => {
    if (externalLoading !== undefined) return;
    const t = setTimeout(() => setInternal(false), delay);
    return () => clearTimeout(t);
  }, [externalLoading, delay]);

  return externalLoading !== undefined ? externalLoading : internal;
}
