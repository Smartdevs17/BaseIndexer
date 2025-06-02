// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Blockchain Data API
export const blockchainApi = {
  // Search functionality
  search: async (query: string) => {
    try {
      const response = await api.post('/indexer/run', { query });
      return response.data;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  },

  // Network stats
  getNetworkStats: async () => {
    try {
      const response = await api.get('/network/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch network stats:', error);
      throw error;
    }
  },

  // Transactions
  getRecentTransactions: async (limit = 10) => {
    try {
      const response = await api.get('/transactions/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  },

  // Blocks
  getRecentBlocks: async (limit = 10) => {
    try {
      const response = await api.get('/blocks/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
      throw error;
    }
  },

  // Addresses
  getTopAddresses: async (limit = 10) => {
    try {
      const response = await api.get('/addresses/top', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      throw error;
    }
  },

  // Address details
  getAddressDetails: async (address: string) => {
    try {
      const response = await api.get(`/addresses/${address}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch address details:', error);
      throw error;
    }
  },

  // Token transfers
  getTokenTransfers: async (tokenAddress: string, options = {}) => {
    try {
      const response = await api.get(`/tokens/${tokenAddress}/transfers`, { params: options });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch token transfers:', error);
      throw error;
    }
  }
};