// src/lib/api.ts
import {
    Transaction,
    Block,
    Address,
    Token,
    TokenTransfer,
    PaginationParams,
    FilterOptions,
    APIResponse,
    NetworkStats,
    ChartData
  } from './types';
  
  import {
    transactions,
    blocks,
    addresses,
    tokens,
    tokenTransfers,
    networkStats,
    transactionChartData,
    gasChartData
  } from './dummy-data';
  
  // Base API URL - to be replaced with actual API when ready
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  
  // Generic fetch function with error handling
  async function fetchData<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<APIResponse<T>> {
    try {
      // For development, return mock data
      if (process.env.NODE_ENV === 'development') {
        return getMockData<T>(endpoint);
      }
  
      const response = await fetch(`${API_URL}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json() as APIResponse<T>;
    } catch (error) {
      console.error('API fetch error:', error);
      return {
        data: [] as unknown as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Mock data function for development
  function getMockData<T>(endpoint: string): Promise<APIResponse<T>> {
    // Simulate network delay
    return new Promise(resolve => {
      setTimeout(() => {
        // Extract path and query parameters
        const [path, queryString] = endpoint.split('?');
        const params = new URLSearchParams(queryString || '');
        
        // Default pagination
        const page = parseInt(params.get('page') || '1', 10);
        const limit = parseInt(params.get('limit') || '10', 10);
        
        // Mock data based on endpoint
        let data: any;
        let total = 0;
        
        if (path.includes('/transactions')) {
          if (path.includes('/transactions/') && path.length > 14) {
            // Single transaction by hash
            const hash = path.split('/transactions/')[1];
            data = transactions.find(tx => tx.hash.includes(hash)) || null;
          } else {
            // Transaction list
            total = transactions.length;
            data = transactions.slice((page - 1) * limit, page * limit);
          }
        } else if (path.includes('/blocks')) {
          if (path.includes('/blocks/') && path.length > 8) {
            // Single block by number
            const blockNumber = parseInt(path.split('/blocks/')[1], 10);
            data = blocks.find(block => block.number === blockNumber) || null;
          } else {
            // Block list
            total = blocks.length;
            data = blocks.slice((page - 1) * limit, page * limit);
          }
        } else if (path.includes('/addresses')) {
          if (path.includes('/addresses/') && path.length > 11) {
            // Single address 
            const addr = path.split('/addresses/')[1];
            data = addresses.find(address => address.address.includes(addr)) || null;
          } else {
            // Address list
            total = addresses.length;
            data = addresses.slice((page - 1) * limit, page * limit);
          }
        } else if (path.includes('/tokens')) {
          if (path.includes('/tokens/') && path.length > 8) {
            // Single token
            const tokenAddr = path.split('/tokens/')[1];
            data = tokens.find(token => token.address.includes(tokenAddr)) || null;
          } else {
            // Token list
            total = tokens.length;
            data = tokens.slice((page - 1) * limit, page * limit);
          }
        } else if (path.includes('/token-transfers')) {
          total = tokenTransfers.length;
          data = tokenTransfers.slice((page - 1) * limit, page * limit);
        } else if (path.includes('/stats')) {
          data = networkStats;
        } else if (path.includes('/charts')) {
          if (path.includes('gas')) {
            data = gasChartData;
          } else {
            data = transactionChartData;
          }
        } else if (path.includes('/search')) {
          const query = params.get('q') || '';
          if (!query) {
            data = [];
          } else {
            // Search across all entities
            const txResults = transactions.filter(tx => 
              tx.hash.includes(query) || 
              tx.from.includes(query) || 
              tx.to.includes(query)
            ).slice(0, 3).map(item => ({ type: 'transaction', item }));
            
            const blockResults = blocks.filter(block => 
              block.hash.includes(query) || 
              block.number.toString().includes(query)
            ).slice(0, 3).map(item => ({ type: 'block', item }));
            
            const addressResults = addresses.filter(addr => 
              addr.address.includes(query) ||
              (addr.name && addr.name.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 3).map(item => ({ type: 'address', item }));
            
            const tokenResults = tokens.filter(token => 
              token.address.includes(query) ||
              token.name.toLowerCase().includes(query.toLowerCase()) ||
              token.symbol.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 3).map(item => ({ type: 'token', item }));
            
            data = [...txResults, ...blockResults, ...addressResults, ...tokenResults];
          }
        } else {
          data = null;
        }
        
        resolve({
          data,
          success: true,
          total,
          page,
          limit
        });
      }, 300); // 300ms delay to simulate network
    });
  }
  
  // Public API functions
  export async function getTransactions(params: PaginationParams & FilterOptions = { page: 1, limit: 10, total: 0 }): Promise<APIResponse<Transaction[]>> {
    const { page = 1, limit = 10, ...filters } = params;
    
    // Convert all filter values to strings
    const stringFilters: Record<string, string> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle Date objects
        if (value instanceof Date) {
          stringFilters[key] = value.toISOString();
        } else {
          // Convert everything else to string
          stringFilters[key] = String(value);
        }
      }
    });
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...stringFilters
    });
    
    return fetchData<Transaction[]>(`/transactions?${queryParams}`);
  }
  
  export async function getTransaction(hash: string): Promise<APIResponse<Transaction>> {
    return fetchData<Transaction>(`/transactions/${hash}`);
  }
  
  export async function getBlocks(params: PaginationParams & FilterOptions = { page: 1, limit: 10, total: 0 }): Promise<APIResponse<Block[]>> {
    const { page = 1, limit = 10, ...filters } = params;
    
    // Convert all filter values to strings
    const stringFilters: Record<string, string> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle Date objects
        if (value instanceof Date) {
          stringFilters[key] = value.toISOString();
        } else {
          // Convert everything else to string
          stringFilters[key] = String(value);
        }
      }
    });
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...stringFilters
    });
    
    return fetchData<Block[]>(`/blocks?${queryParams}`);
  }
  
  export async function getBlock(blockNumber: number): Promise<APIResponse<Block>> {
    return fetchData<Block>(`/blocks/${blockNumber}`);
  }
  
  export async function getAddresses(params: PaginationParams & FilterOptions = { page: 1, limit: 10, total: 0 }): Promise<APIResponse<Address[]>> {
    const { page = 1, limit = 10, ...filters } = params;
    
    // Convert all filter values to strings
    const stringFilters: Record<string, string> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle Date objects
        if (value instanceof Date) {
          stringFilters[key] = value.toISOString();
        } else {
          // Convert everything else to string
          stringFilters[key] = String(value);
        }
      }
    });
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...stringFilters
    });
    
    return fetchData<Address[]>(`/addresses?${queryParams}`);
  }
  
  export async function getAddress(address: string): Promise<APIResponse<Address>> {
    return fetchData<Address>(`/addresses/${address}`);
  }
  
  export async function getAddressTransactions(
    address: string,
    params: PaginationParams & FilterOptions = { page: 1, limit: 10, total: 0 }
  ): Promise<APIResponse<Transaction[]>> {
    const { page = 1, limit = 10, ...filters } = params;
    
    // Convert all filter values to strings
    const stringFilters: Record<string, string> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle Date objects
        if (value instanceof Date) {
          stringFilters[key] = value.toISOString();
        } else {
          // Convert everything else to string
          stringFilters[key] = String(value);
        }
      }
    });
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...stringFilters
    });
    
    return fetchData<Transaction[]>(`/addresses/${address}/transactions?${queryParams}`);
  }
  
  export async function getTokens(params: PaginationParams & FilterOptions = { page: 1, limit: 10, total: 0 }): Promise<APIResponse<Token[]>> {
    const { page = 1, limit = 10, ...filters } = params;
    
    // Convert all filter values to strings
    const stringFilters: Record<string, string> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle Date objects
        if (value instanceof Date) {
          stringFilters[key] = value.toISOString();
        } else {
          // Convert everything else to string
          stringFilters[key] = String(value);
        }
      }
    });
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...stringFilters
    });
    
    return fetchData<Token[]>(`/tokens?${queryParams}`);
  }
  
  export async function getToken(address: string): Promise<APIResponse<Token>> {
    return fetchData<Token>(`/tokens/${address}`);
  }
  
  export async function getTokenTransfers(
    tokenAddress: string,
    params: PaginationParams & FilterOptions = { page: 1, limit: 10, total: 0 }
  ): Promise<APIResponse<TokenTransfer[]>> {
    const { page = 1, limit = 10, ...filters } = params;
    
    // Convert all filter values to strings
    const stringFilters: Record<string, string> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle Date objects
        if (value instanceof Date) {
          stringFilters[key] = value.toISOString();
        } else {
          // Convert everything else to string
          stringFilters[key] = String(value);
        }
      }
    });
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...stringFilters
    });
    
    return fetchData<TokenTransfer[]>(`/tokens/${tokenAddress}/transfers?${queryParams}`);
  }
  
  export async function getNetworkStats(): Promise<APIResponse<NetworkStats>> {
    return fetchData<NetworkStats>('/stats');
  }
  
  export async function getTransactionChartData(
    timeframe: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<APIResponse<ChartData>> {
    const queryParams = new URLSearchParams({
      timeframe
    });
    
    return fetchData<ChartData>(`/charts/transactions?${queryParams}`);
  }
  
  export async function getGasChartData(
    timeframe: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<APIResponse<ChartData>> {
    const queryParams = new URLSearchParams({
      timeframe
    });
    
    return fetchData<ChartData>(`/charts/gas?${queryParams}`);
  }
  
  export async function search(query: string): Promise<APIResponse<Array<{type: string, item: any}>>> {
    const queryParams = new URLSearchParams({
      q: query
    });
    
    return fetchData<Array<{type: string, item: any}>>(`/search?${queryParams}`);
  }