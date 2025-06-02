// src/controllers/dbExtended.ts
import TransferQueryService from './db';
import TransferEvent from '../models/TransferEvent';
import { Op } from 'sequelize';

// Extend the TransferQueryService with additional methods needed by the hooks
class ExtendedTransferQueryService {
  // Re-export the original methods
  getTransfersByAddress = TransferQueryService.getTransfersByAddress.bind(TransferQueryService);
  getTransfersFrom = TransferQueryService.getTransfersFrom.bind(TransferQueryService);
  getTransfersTo = TransferQueryService.getTransfersTo.bind(TransferQueryService);
  getTransfersByToken = TransferQueryService.getTransfersByToken.bind(TransferQueryService);
  getTransfersByAddressAndToken = TransferQueryService.getTransfersByAddressAndToken.bind(TransferQueryService);

  // Add method for getting recent transfers
  async getRecentTransfers(options: any = {}) {
    const {
      limit = 10,
      offset = 0,
      sortBy = 'timestamp',
      sortDir = 'DESC',
    } = options;

    try {
      return await TransferEvent.findAll({
        order: [[sortBy, sortDir]],
        limit,
        offset,
      });
    } catch (error) {
      console.error('Error querying recent transfers:', error);
      throw error;
    }
  }

  // Add method for getting recent blocks
  async getRecentBlocks(options: any = {}) {
    const { limit = 10 } = options;
    
    try {
      // If you have a Block model, use that
      // Otherwise, you can use raw SQL or implement this with another ORM method
      // For now, we'll return placeholder data
      return Array.from({ length: limit }, (_, i) => ({
        id: `block-${i}`,
        number: `${14000000 - i}`,
        hash: `0x${Math.random().toString(16).substring(2, 66)}`,
        timestamp: new Date(Date.now() - i * 15000).toISOString(),
        transactions: Math.floor(Math.random() * 100),
        validator: `0x${Math.random().toString(16).substring(2, 42)}`,
        gasUsed: `${Math.floor(Math.random() * 8000000)}`,
      }));
    } catch (error) {
      console.error('Error querying recent blocks:', error);
      throw error;
    }
  }

  // Add method for getting top addresses
  async getTopAddresses(options: any = {}) {
    const { limit = 10 } = options;
    
    try {
      // This would typically be a more complex query involving aggregation
      // For now, we'll return placeholder data
      return Array.from({ length: limit }, (_, i) => ({
        address: `0x${Math.random().toString(16).substring(2, 42)}`,
        balance: `${(Math.random() * 1000).toFixed(4)} ETH`,
        transactions: Math.floor(Math.random() * 5000),
        lastActive: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      }));
    } catch (error) {
      console.error('Error querying top addresses:', error);
      throw error;
    }
  }

  // Add method for getting network stats
  async getStats() {
    try {
      // This would typically involve multiple queries or a pre-computed table
      // For now, we'll return placeholder data
      return {
        tps: 12.5,
        activeAddresses: 42589,
        totalTransactions: 8754320,
        averageGasPrice: '15 gwei',
        marketCap: '$52.4B',
      };
    } catch (error) {
      console.error('Error querying network stats:', error);
      throw error;
    }
  }
}

export default new ExtendedTransferQueryService();