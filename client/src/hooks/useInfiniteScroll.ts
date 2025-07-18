import { useCallback, useEffect, useRef, useState } from 'react';

interface InfiniteScrollOptions {
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number;
}

interface UseInfiniteScrollResult<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  error: any;
  setLastElement: (element: HTMLElement | null) => void;
  reset: () => void;
  loadMore: () => void;
}

export function useInfiniteScroll<T>(
  fetchFn: (page: number) => Promise<{ items: T[]; hasMore: boolean }>,
  options: InfiniteScrollOptions = { root: null, rootMargin: '200px', threshold: 0 }
): UseInfiniteScrollResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [resetVersion, setResetVersion] = useState(0); // <<-- dodato
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLElement | null>(null);

  // Wrapper za loadMore koji koristi lokalnu page vrednost
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page);
      setItems(prev => page === 1 ? result.items : [...prev, ...result.items]); // ovo resetuje na prvoj strani!
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, hasMore, loading]);

  // Kada god resetVersion promeni vrednost, resetuj state i pokreni loadMore
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [resetVersion]);

  // Kada page == 1 i promenjen je resetVersion, pokreni loadMore odmah (fetch prvu stranu)
  useEffect(() => {
    if (page === 1) {
      loadMore();
    }
    // eslint-disable-next-line
  }, [page, resetVersion]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, options);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, loadMore, options.rootMargin, options.threshold]);

  const setLastElement = useCallback((element: HTMLElement | null) => {
    if (observerRef.current && lastElementRef.current) {
      observerRef.current.unobserve(lastElementRef.current);
    }

    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }

    lastElementRef.current = element;
  }, []);

  // NOVO reset: inkrementira resetVersion
  const reset = useCallback(() => {
    setResetVersion(ver => ver + 1);
  }, []);

  return {
    items,
    loading,
    hasMore,
    error,
    setLastElement,
    reset,
    loadMore,
  };
}
