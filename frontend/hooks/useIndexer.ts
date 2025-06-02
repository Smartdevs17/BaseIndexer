import { useState, useCallback } from 'react';

// Improved IndexerControl hook that works with your backend
export function useIndexerControl() {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook for indexer control 
  const startIndexer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/indexer/start`, {
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

export interface TransferEvent {
  id: string;
  from: string;
  to: string;
  value: string;
  tokenAddress: string;
  blockNumber: number;
  timestamp: string | Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface NetworkStats {
  tps: number;
  activeAddresses: number;
  totalTransactions: number;
  averageGasPrice: string;
  marketCap: string;
}

export const useIndexer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TransferEvent[]>([]);

  const fetchIndexerData = useCallback(async (query: string, options: QueryOptions = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the same endpoint URL that works with your AI Assistant
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/indexer/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: query,
          ...options
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Invalid data format');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransfersByToken = useCallback(async (
    tokenAddress: string,
    options: QueryOptions = {}
  ) => {
    try {
      const data = await fetchIndexerData(`Get transfers for token ${tokenAddress}`, options);
      setData(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Error fetching token transfers:', err);
      return [];
    }
  }, [fetchIndexerData]);

  const getTransfersByAddress = useCallback(async (
    address: string,
    options: QueryOptions = {}
  ) => {
    try {
      const data = await fetchIndexerData(`Get transfers for address ${address}`, options);
      setData(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Error fetching address transfers:', err);
      return [];
    }
  }, [fetchIndexerData]);

  const getRecentTransfers = useCallback(async (
    options: QueryOptions = {}
  ) => {
    try {
      const data = await fetchIndexerData('Get recent transfers', options);
      setData(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Error fetching recent transfers:', err);
      return [];
    }
  }, [fetchIndexerData]);

  const getStats = useCallback(async () => {
    try {
      const data = await fetchIndexerData('Get network statistics');
      return {
        tps: data?.tps || 0,
        activeAddresses: data?.activeAddresses || 0,
        totalTransactions: data?.totalTransactions || 0,
        averageGasPrice: data?.averageGasPrice || '0 gwei',
        marketCap: data?.marketCap || '$0'
      } as NetworkStats;
    } catch (err) {
      console.error('Error fetching network stats:', err);
      return {
        tps: 0,
        activeAddresses: 0,
        totalTransactions: 0,
        averageGasPrice: '0 gwei',
        marketCap: '$0'
      } as NetworkStats;
    }
  }, [fetchIndexerData]);

  return {
    isLoading,
    error,
    data,
    getTransfersByToken,
    getTransfersByAddress,
    getRecentTransfers,
    getStats,
  };
};