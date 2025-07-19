// frontend/lib/config.ts - BACKEND URL CONFIGURATION
export const API_CONFIG = {
  // Use hosted backend URL - replace with your actual hosted backend URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://baseindexer-production.up.railway.app',
  
  // Development fallback
  DEV_URL: 'http://localhost:3000',
  
  // Get the appropriate URL based on environment
  getApiUrl: () => {
    if (process.env.NODE_ENV === 'development') {
      return process.env.NEXT_PUBLIC_API_URL || API_CONFIG.DEV_URL
    }
    return process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BASE_URL
  }
}

// API endpoints
export const ENDPOINTS = {
  // Explorer
  EXPLORER_STATS: '/api/explorer/stats',
  EXPLORER_ACTIVITY: '/api/explorer/activity',
  EXPLORER_NETWORK: '/api/explorer/network',
  EXPLORER_TOKENS_TOP: '/api/explorer/tokens/top',
  EXPLORER_TOKENS_TRENDING: '/api/explorer/tokens/trending',
  
  // Analytics
  ANALYTICS_OVERVIEW: '/api/analytics/overview',
  ANALYTICS_METRICS: '/api/analytics/metrics',
  ANALYTICS_VOLUME: '/api/analytics/volume',
  ANALYTICS_TOKENS: '/api/analytics/tokens',
  ANALYTICS_GAS: '/api/analytics/gas',
  ANALYTICS_TOKENS_TOP: '/api/analytics/tokens/top',
  
  // Blocks
  BLOCKS: '/api/blocks',
  BLOCKS_RECENT: '/api/blocks/recent',
  BLOCKS_STATS: '/api/blocks/stats',
  BLOCKS_SEARCH: '/api/blocks/search',
  BLOCKS_BY_NUMBER: (blockNumber: number) => `/api/blocks/${blockNumber}`,
  
  // Transactions
  TRANSACTIONS: '/api/transactions',
  TRANSACTIONS_RECENT: '/api/transactions/recent',
  TRANSFERS_BY_ADDRESS: (address: string) => `/api/transfers/${address}`,
  
  // AI/Indexer
  INDEXER_RUN: '/indexer/run',
  
  // Base API
  BASE_INDEX: (address: string) => `/api/baseindex/${address}`,
}

// Create full URL helper
export const createApiUrl = (endpoint: string) => {
  const baseUrl = API_CONFIG.getApiUrl()
  return `${baseUrl}${endpoint}`
}

// Frontend environment configuration
export const FRONTEND_CONFIG = {
  // Add your hosted frontend URL here if needed
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  
  // Feature flags
  FEATURES: {
    AUTO_REFRESH: true,
    SEARCH: true,
    DARK_MODE: true,
    EXPORT: true,
  }
}