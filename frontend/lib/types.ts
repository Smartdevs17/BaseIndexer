// src/lib/types.ts

// Basic blockchain data types
export interface Transaction {
    hash: string;
    blockNumber: number;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    gasPrice: string;
    timestamp: number;
    status: 'success' | 'failed';
    methodId?: string;
    functionName?: string;
    input?: string;
  }
  
  export interface Block {
    number: number;
    hash: string;
    timestamp: number;
    transactions: number;
    miner: string;
    gasUsed: string;
    gasLimit: string;
    baseFeePerGas?: string;
    size: string;
  }
  
  export interface Address {
    address: string;
    balance: string;
    txCount: number;
    type: 'contract' | 'wallet';
    creationTx?: string;
    creator?: string;
    name?: string;
    verified?: boolean;
  }
  
  export interface Token {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    holders: number;
    type: 'ERC20' | 'ERC721' | 'ERC1155';
  }
  
  export interface TokenTransfer {
    hash: string;
    from: string;
    to: string;
    value: string;
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: number;
    timestamp: number;
  }
  
  // AI chat related types
  export interface ChatMessage {
    id: string;
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: number;
  }
  
  export interface ChatSession {
    id: string;
    messages: ChatMessage[];
    createdAt: number;
    title?: string;
  }
  
  // Search and data display types
  export interface SearchResult {
    type: 'address' | 'transaction' | 'block' | 'token';
    item: Address | Transaction | Block | Token;
  }
  
  export interface PaginationParams {
    page: number;
    limit: number;
    total: number;
  }
  
  export interface FilterOptions {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    type?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }
  
  // API response types
  export interface APIResponse<T> {
    data: T;
    pagination?: PaginationParams;
    success: boolean;
    error?: string;
    total?: number;
    page?: number;
    limit?: number;
  }
  
  // Analytics data types
  export interface NetworkStats {
    totalTransactions: number;
    totalAddresses: number;
    totalBlocks: number;
    averageBlockTime: number;
    averageGasPrice: string;
    currentTPS: number;
    dailyTransactions: number;
  }
  
  export interface ChartDataPoint {
    timestamp: number;
    value: number;
  }
  
  export interface ChartData {
    label: string;
    data: ChartDataPoint[];
  }
  
  // Export data types
  export type ExportFormat = 'csv' | 'xlsx' | 'json';
  
  export interface ExportOptions {
    format: ExportFormat;
    fileName: string;
    data: any[];
  }