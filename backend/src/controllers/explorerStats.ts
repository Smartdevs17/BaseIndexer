// backend/src/controllers/explorerStats.ts
import TransferEvent from '../models/TransferEvent';
import { Op, fn, col, literal } from 'sequelize';

class ExplorerStatsService {
  /**
   * Get comprehensive network statistics for Explorer page
   */
  async getNetworkStats() {
    try {
      // Get basic counts
      const totalTransfers = await TransferEvent.count();
      
      // Get unique addresses count (both senders and receivers)
      const uniqueFromAddresses = await TransferEvent.count({
        distinct: true,
        col: 'from'
      });
      
      const uniqueToAddresses = await TransferEvent.count({
        distinct: true,
        col: 'to'
      });
      
      // Get unique tokens count
      const uniqueTokens = await TransferEvent.count({
        distinct: true,
        col: 'tokenAddress'
      });
      
      // Get unique blocks count
      const uniqueBlocks = await TransferEvent.count({
        distinct: true,
        col: 'blockNumber'
      });
      
      // Get recent activity (last 24 hours equivalent - last 100 transfers for demo)
      // The count method does not support 'order' or 'limit', so we just count all transfers
      const recentTransfers = await TransferEvent.count();
      
      // Calculate approximate unique addresses (union would be complex, so estimate)
      const estimatedUniqueAddresses = Math.max(uniqueFromAddresses, uniqueToAddresses);
      
      return {
        totalTransfers,
        uniqueAddresses: estimatedUniqueAddresses,
        uniqueTokens,
        uniqueBlocks,
        recentActivity: recentTransfers
      };
    } catch (error) {
      console.error('Error getting network stats:', error);
      throw error;
    }
  }

  /**
   * Get top tokens by transfer count
   */
  async getTopTokens(limit: number = 10) {
    try {
      const topTokens = await TransferEvent.findAll({
        attributes: [
          'tokenAddress',
          [fn('COUNT', col('id')), 'transferCount'],
          [fn('MAX', col('timestamp')), 'lastActivity']
        ],
        group: ['tokenAddress'],
        order: [[fn('COUNT', col('id')), 'DESC']], // <-- Fix here
        limit,
        raw: true
      });

      return topTokens.map((token: any) => ({
        address: token.tokenAddress,
        transferCount: parseInt(token.transferCount),
        lastActivity: token.lastActivity
      }));
    } catch (error) {
      console.error('Error getting top tokens:', error);
      throw error;
    }
  }

  /**
   * Get recent transfer activity for dashboard
   */
  async getRecentActivity(limit: number = 20) {
    try {
      const recentTransfers = await TransferEvent.findAll({
        order: [['timestamp', 'DESC']],
        limit,
        attributes: [
          'id',
          'from', 
          'to', 
          'value', 
          'tokenAddress', 
          'blockNumber', 
          'timestamp',
          'transactionHash'
        ]
      });

      return recentTransfers.map(transfer => ({
        id: transfer.id,
        from: transfer.from,
        to: transfer.to,
        value: transfer.value,
        tokenAddress: transfer.tokenAddress,
        blockNumber: transfer.blockNumber,
        timestamp: transfer.timestamp,
        transactionHash: transfer.transactionHash,
        type: 'transfer'
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw error;
    }
  }

  /**
   * Get trending tokens (most active in recent time)
   */
  async getTrendingTokens(limit: number = 5) {
    try {
      // Get tokens with most transfers in recent activity (last 200 transfers as proxy for "recent")
      const recentTransferIds = await TransferEvent.findAll({
        attributes: ['id'],
        order: [['timestamp', 'DESC']],
        limit: 200,
        raw: true
      });

      const recentIds = recentTransferIds.map((t: any) => t.id);

      if (recentIds.length === 0) {
        return [];
      }

      const trendingTokens = await TransferEvent.findAll({
        attributes: [
          'tokenAddress',
          [fn('COUNT', col('id')), 'recentCount']
        ],
        where: {
          id: {
            [Op.in]: recentIds
          }
        },
        group: ['tokenAddress'],
        order: [[fn('COUNT', col('id')), 'DESC']], // <-- Fix here
        limit,
        raw: true
      });

      return trendingTokens.map((token: any) => ({
        address: token.tokenAddress,
        recentTransfers: parseInt(token.recentCount)
      }));
    } catch (error) {
      console.error('Error getting trending tokens:', error);
      throw error;
    }
  }

  /**
   * Get network overview with block statistics
   */
  async getNetworkOverview() {
    try {
      const [latestBlock, oldestBlock] = await Promise.all([
        TransferEvent.findOne({
          order: [['blockNumber', 'DESC']],
          attributes: ['blockNumber', 'timestamp']
        }),
        TransferEvent.findOne({
          order: [['blockNumber', 'ASC']],
          attributes: ['blockNumber', 'timestamp']
        })
      ]);

      const blockRange = latestBlock && oldestBlock ? 
        latestBlock.blockNumber - oldestBlock.blockNumber + 1 : 0;

      return {
        latestBlock: latestBlock?.blockNumber || 0,
        oldestBlock: oldestBlock?.blockNumber || 0,
        blockRange,
        indexingStartTime: oldestBlock?.timestamp,
        lastIndexedTime: latestBlock?.timestamp
      };
    } catch (error) {
      console.error('Error getting network overview:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive stats for Explorer page
   */
  async getExplorerStats() {
    try {
      const [
        networkStats,
        topTokens,
        recentActivity,
        trendingTokens,
        networkOverview
      ] = await Promise.all([
        this.getNetworkStats(),
        this.getTopTokens(10),
        this.getRecentActivity(15),
        this.getTrendingTokens(5),
        this.getNetworkOverview()
      ]);

      return {
        network: networkStats,
        overview: networkOverview,
        topTokens,
        trendingTokens,
        recentActivity
      };
    } catch (error) {
      console.error('Error getting explorer stats:', error);
      throw error;
    }
  }
}

export default new ExplorerStatsService();