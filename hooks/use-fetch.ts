'use client';

import * as React from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: any[] = []): FetchState<T> {
  const [state, setState] = React.useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
    refetch: () => {},
  });
  const [refetchKey, setRefetchKey] = React.useState(0);

  const refetch = React.useCallback(() => setRefetchKey((k) => k + 1), []);

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, data: null, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null, refetch });
      })
      .catch((err) => {
        if (active) setState({ data: null, loading: false, error: err.message ?? 'Failed to load', refetch });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refetchKey]);

  return state;
}
