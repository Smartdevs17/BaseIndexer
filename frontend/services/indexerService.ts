// src/services/indexerService.ts
import axios from 'axios';

const INDEXER_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const indexerApi = axios.create({
  baseURL: INDEXER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const indexerService = {
  runQuery: async (query: string) => {
    try {
      const response = await indexerApi.post('/indexer/run', { query });
      return response.data;
    } catch (error) {
      console.error('Indexer query failed:', error);
      throw error;
    }
  },

  getTransferById: async (id: number) => {
    try {
      const response = await indexerApi.get(`/indexer/transfers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transfer:', error);
      throw error;
    }
  },

  // Add more methods as needed based on your API endpoints
};

export default indexerService;