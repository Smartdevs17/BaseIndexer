// src/hooks/useIndexerControl.ts
import { useState } from 'react';

export function useIndexerControl() {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startIndexer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}`, {
        method: 'GET'
      });
      if (!response.ok) throw new Error('Failed to start indexer');
      setIsRunning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { isRunning, loading, error, startIndexer };
}