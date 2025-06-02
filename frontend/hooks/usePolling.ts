// hooks/usePolling.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for polling data at specified intervals
 * @param {function} fetchFunction - Function to fetch data
 * @param {number} interval - Polling interval in milliseconds
 * @param {boolean} immediate - Whether to fetch immediately on mount
 * @param {any} initialData - Initial data to use before first fetch
 * @returns {Object} Data, loading state, error state, and manual refresh function
 */
interface UsePollingResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
  newDataAvailable: boolean;
  setNewDataAvailable: React.Dispatch<React.SetStateAction<boolean>>;
}

export function usePolling<T>(
  fetchFunction: () => Promise<T>,
  interval: number = 10000,
  immediate: boolean = true,
  initialData: T | null = null
): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newDataAvailable, setNewDataAvailable] = useState<boolean>(false);

  const fetchData = useCallback(
    async (showLoading: boolean = true, notifyNew: boolean = false) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const result = await fetchFunction();

        // Check if this is new data
        if (data && JSON.stringify(result) !== JSON.stringify(data)) {
          if (notifyNew) {
            setNewDataAvailable(true);
          }
        }

        setData(result);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching data:', err);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [fetchFunction, data]
  );

  const refresh = useCallback(() => {
    setNewDataAvailable(false);
    return fetchData(true, false);
  }, [fetchData]);

  // Silent background check for new data
  const checkForUpdates = useCallback(() => {
    return fetchData(false, true);
  }, [fetchData]);

  // Initial fetch on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    // Set up polling interval
    const pollTimer = setInterval(checkForUpdates, interval);

    // Clean up timer on unmount
    return () => clearInterval(pollTimer);
  }, [fetchData, checkForUpdates, immediate, interval]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated,
    newDataAvailable,
    setNewDataAvailable,
  };
}