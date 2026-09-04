"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { apiRequest } from "@/lib/api-client";

type UseFetchResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  setData: Dispatch<SetStateAction<T | null>>;
};

export function useFetch<T>(path: string | null): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(path));
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!path) {
      return;
    }

    let cancelled = false;

    apiRequest<T>(path)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  return { data, isLoading, error, refetch, setData };
}
