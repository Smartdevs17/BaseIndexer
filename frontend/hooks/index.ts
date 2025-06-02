// src/app/indexer/hooks/index.ts
import { 
    useRecentTransactions as useTransactionsHook,
    useRecentBlocks as useBlocksHook,
  } from './useBlockchainData';
  
  // Re-export the hooks for use in the page
  export const useRecentTransactions = useTransactionsHook;
  export const useRecentBlocks = useBlocksHook;