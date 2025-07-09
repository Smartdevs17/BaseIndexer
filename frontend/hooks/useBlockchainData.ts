import { useState, useEffect, useCallback } from 'react';

// Define interfaces for our blockchain data
export interface Transaction {
  id: string | number;
  hash?: string;
  from: string;
  to: string;
  value: string;
  tokenAddress?: string;
  blockNumber?: number;
  timestamp: string | Date;
  status?: 'success' | 'failed' | 'pending';
  gasUsed?: number;
  gasPrice?: string;
}

export interface Block {
  id?: string;
  number: number | string;
  hash: string;
  timestamp: string | Date;
  transactions: number;
  validator: string;
  gasUsed: string;
}

// Helper to generate realistic ETH values
const generateRandomEthValue = () => {
  // Generate values between 0.001 and 5 ETH with varying decimal places
  const baseValue = Math.random() * 5;
  // 20% chance of a larger transaction (5-50 ETH)
  if (Math.random() > 0.8) {
    return (Math.random() * 45 + 5).toFixed(4);
  }
  
  // 10% chance of a small transaction (< 0.01 ETH)
  if (Math.random() > 0.9) {
    return (Math.random() * 0.01).toFixed(6);
  }
  
  // Standard transaction
  return baseValue.toFixed(4);
};

// Hook for indexer control
export function useIndexerControl() {
  const [isRunning, setIsRunning] = useState(true); // Default to running
  const [indexerLoading, setIndexerLoading] = useState(false);
  const [indexerError, setIndexerError] = useState<string | null>(null);

  // Check indexer status
  const checkIndexerStatus = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/indexer/status`);
      if (!response.ok) throw new Error('Failed to check indexer status');
      const data = await response.json();
      setIsRunning(data.isRunning);
      return data.isRunning;
    } catch (error) {
      console.error('Error checking indexer status:', error);
      return true; // Default to running if check fails
    }
  }, []);

  // Start indexer function - keeping it for compatibility but not exposing in UI
  const startIndexer = useCallback(async () => {
    setIndexerLoading(true);
    setIndexerError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/indexer/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start indexer');
      }
      
      const data = await response.json();
      setIsRunning(data.isRunning || true);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error starting indexer';
      setIndexerError(errorMessage);
      console.error('Indexer start error:', errorMessage);
      return false;
    } finally {
      setIndexerLoading(false);
    }
  }, []);

  // Check indexer status on component mount
  // useEffect(() => {
  //   checkIndexerStatus();
  //   // Set up a periodic check every 30 seconds
  //   const intervalId = setInterval(checkIndexerStatus, 30000);
  //   return () => clearInterval(intervalId);
  // }, [checkIndexerStatus]);

  return { isRunning, startIndexer, indexerLoading, indexerError };
}

// Hook for recent transactions with manual refresh function
export function useRecentTransactions(limit = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch transactions that can be called on demand
  const refreshTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // First try to fetch from our backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/transactions/recent?limit=${limit}`);
      
      if (!response.ok) {
        // throw new Error(`Failed to fetch transactions: ${response.status}`);
        // console.error('Error fetching transactions:', response.statusText);
        return []; // Return empty array if fetch fails
      }
      
      const data = await response.json();
      const transformedData: Transaction[] = data.data.map((tx: any) => ({
        id: tx.id || `tx-${Math.random().toString(16).substring(2, 8)}`,
        hash: tx.hash || tx.id, 
        from: tx.from,
        to: tx.to,
        value: tx.value,
        tokenAddress: tx.tokenAddress,
        blockNumber: tx.blockNumber,
        timestamp: tx.timestamp,
        status: tx.status || 'success'
      }));
      
      setTransactions(transformedData);
      return transformedData;
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error);
      
      // Create fallback data for development/testing with realistic ETH values
      const placeholderTransactions: Transaction[] = Array.from({ length: limit }, (_, i) => ({
        id: `tx-${i}`,
        hash: `0x${Math.random().toString(16).substring(2, 66)}`,
        from: `0x${Math.random().toString(16).substring(2, 42)}`,
        to: `0x${Math.random().toString(16).substring(2, 42)}`,
        value: generateRandomEthValue(), // Use the helper function for realistic values
        tokenAddress: Math.random() > 0.3 ? `0x${Math.random().toString(16).substring(2, 42)}` : undefined,
        blockNumber: 14000000 - i,
        timestamp: new Date(Date.now() - i * 15000).toISOString(),
        status: Math.random() > 0.9 ? (Math.random() > 0.5 ? 'failed' : 'pending') : 'success'
      }));
      
      setTransactions(placeholderTransactions);
      return placeholderTransactions;
    } finally {
      setLoading(false);
    }
  }, [limit]);

  return { transactions, loading, refreshTransactions };
}

// Hook for recent blocks with manual refresh function
export function useRecentBlocks(limit = 10) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Function to fetch blocks that can be called on demand
  const refreshBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/blocks/recent?limit=${limit}`);
      
      if (!response.ok) {
        // throw new Error(`Failed to fetch blocks: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      const formattedBlocks: Block[] = data.data.map((block: any) => ({
        number: block.number,
        hash: block.hash || `0x${Math.random().toString(16).substring(2, 66)}`,
        timestamp: block.timestamp || new Date().toISOString(),
        transactions: block.transactions || Math.floor(Math.random() * 100),
        validator: block.validator || `0x${Math.random().toString(16).substring(2, 42)}`, 
        gasUsed: block.gasUsed || `${Math.floor(Math.random() * 8000000)}`,
      }));
      
      setBlocks(formattedBlocks);
      return formattedBlocks;
    } catch (error) {
      console.error('Failed to fetch recent blocks:', error);
      
      // Fallback data for development/testing
      const placeholderBlocks: Block[] = Array.from({ length: limit }, (_, i) => ({
        number: 14000000 - i,
        hash: `0x${Math.random().toString(16).substring(2, 66)}`,
        timestamp: new Date(Date.now() - i * 15000).toISOString(),
        transactions: Math.floor(Math.random() * 100),
        validator: `0x${Math.random().toString(16).substring(2, 42)}`,
        gasUsed: `${Math.floor(Math.random() * 8000000)}`,
      }));
      
      setBlocks(placeholderBlocks);
      return placeholderBlocks;
    } finally {
      setLoading(false);
    }
  }, [limit]);

  return { blocks, loading, refreshBlocks };
}

// Custom hook for sending targeted queries to the indexer
export function useIndexerQuery() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryAddress = useCallback(async (address: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/indexer/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: `index this address ${address}`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to query address: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Query failed');
      }
      
      setResults(data.data || []);
      return data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error querying address';
      setError(errorMessage);
      console.error('Address query error:', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const queryToken = useCallback(async (tokenAddress: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/indexer/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: `index this token ${tokenAddress}`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to query token: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Token query failed');
      }
      
      setResults(data.data || []);
      return data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error querying token';
      setError(errorMessage);
      console.error('Token query error:', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    queryAddress,
    queryToken
  };
}