import React, { useState, useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  pageSize?: number;
  rootMargin?: string;
}

interface UseInfiniteScrollResult {
  displayCount: number;
  isMoreLoading: boolean;
  sentinelRef: React.RefObject<HTMLDivElement>;
}

/**
 * Manages paginated display with IntersectionObserver-based infinite scroll.
 * Resets displayCount whenever totalCount or a resetKey changes.
 */
export function useInfiniteScroll(
  totalCount: number,
  isLoading: boolean,
  { pageSize = 6, rootMargin = '200px' }: UseInfiniteScrollOptions = {}
): UseInfiniteScrollResult {
  const [displayCount, setDisplayCount] = useState(pageSize);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when the dataset changes
  useEffect(() => {
    setDisplayCount(pageSize);
  }, [totalCount, pageSize]);

  useEffect(() => {
    if (isLoading) return;

    const loadMore = () => {
      if (isMoreLoading) return;
      setIsMoreLoading(true);
      setTimeout(() => {
        setDisplayCount(prev => Math.min(prev + pageSize, totalCount));
        setIsMoreLoading(false);
      }, 600);
    };

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && totalCount > displayCount && !isMoreLoading) {
          loadMore();
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );

    const current = sentinelRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, [totalCount, displayCount, isMoreLoading, isLoading, pageSize, rootMargin]);

  return { displayCount, isMoreLoading, sentinelRef };
}
