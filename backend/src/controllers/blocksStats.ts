import TransferEvent from '../models/TransferEvent';
import { Op, fn, col, literal } from 'sequelize';

interface BlockSummary {
  number: number;
  hash: string;
  timestamp: string;
  transactions: number;
  validator: string;
  gasUsed: string;
  gasLimit: string;
  baseFeePerGas: number;
  reward: string;
  size: number;
  totalValue: string;
  uniqueTokens: number;
  topToken: string;
}

class BlocksStatsService {
  /**
   * Get block summaries aggregated from transfer data
   */
  async getBlockSummaries(limit: number = 50) {
    try {
      // Get block data aggregated from transfers
      const blockData = await TransferEvent.findAll({
        attributes: [
          'blockNumber',
          [fn('COUNT', col('id')), 'transferCount'],
          [fn('MAX', col('timestamp')), 'timestamp'],
          [fn('COUNT', fn('DISTINCT', col('tokenAddress'))), 'uniqueTokens'],
          [fn('SUM', literal('CAST(value AS DECIMAL)')), 'totalValue']
        ],
        group: ['blockNumber'],
        order: [[col('blockNumber'), 'DESC']],
        limit,
        raw: true
      });

      // Transform to block format
      const blocks: BlockSummary[] = await Promise.all(
        blockData.map(async (block: any) => {
          const blockNumber = block.blockNumber;
          
          // Get the most active token in this block
          const topTokenData = await TransferEvent.findOne({
            attributes: [
              'tokenAddress',
              [fn('COUNT', col('id')), 'count']
            ],
            where: { blockNumber },
            group: ['tokenAddress'],
            order: [[literal('count'), 'DESC']],
            raw: true
          });

          return {
            number: blockNumber,
            hash: `0x${blockNumber.toString(16).padStart(64, '0')}`, // Generate block hash from number
            timestamp: block.timestamp,
            transactions: parseInt(block.transferCount),
            validator: `0xvalidator${blockNumber.toString().slice(-10).padStart(10, '0')}`, // Mock validator
            gasUsed: `${(parseInt(block.transferCount) * 0.021).toFixed(1)}M`, // Estimate gas usage
            gasLimit: '30.0M', // Standard gas limit
            baseFeePerGas: 0.00000001, // Mock base fee
            reward: (parseInt(block.transferCount) * 0.0001).toFixed(4), // Mock reward
            size: parseInt(block.transferCount) * 500 + 50000, // Estimate block size
            totalValue: parseFloat(block.totalValue || '0').toFixed(2),
            uniqueTokens: parseInt(block.uniqueTokens),
            topToken: topTokenData?.tokenAddress || 'Unknown'
          };
        })
      );

      return blocks;
    } catch (error) {
      console.error('Error getting block summaries:', error);
      throw error;
    }
  }

  /**
   * Get detailed block information by block number
   */
  async getBlockDetails(blockNumber: number) {
    try {
      // Get all transfers in this block
      const transfers = await TransferEvent.findAll({
        where: { blockNumber },
        order: [['timestamp', 'DESC']]
      });

      if (transfers.length === 0) {
        return null;
      }

      // Calculate block statistics
      const totalValue = transfers.reduce((sum, transfer) => {
        return sum + parseFloat(transfer.value || '0');
      }, 0);

      const uniqueTokens = new Set(transfers.map(t => t.tokenAddress)).size;
      const uniqueAddresses = new Set([
        ...transfers.map(t => t.from),
        ...transfers.map(t => t.to)
      ]).size;

      // Get token distribution
      const tokenCounts: { [key: string]: number } = {};
      transfers.forEach(transfer => {
        tokenCounts[transfer.tokenAddress] = (tokenCounts[transfer.tokenAddress] || 0) + 1;
      });

      const topToken = Object.entries(tokenCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

      return {
        number: blockNumber,
        hash: `0x${blockNumber.toString(16).padStart(64, '0')}`,
        timestamp: transfers[0].timestamp,
        transactions: transfers.length,
        validator: `0xvalidator${blockNumber.toString().slice(-10).padStart(10, '0')}`,
        gasUsed: `${(transfers.length * 0.021).toFixed(1)}M`,
        gasLimit: '30.0M',
        baseFeePerGas: 0.00000001,
        reward: (transfers.length * 0.0001).toFixed(4),
        size: transfers.length * 500 + 50000,
        totalValue: totalValue.toFixed(2),
        uniqueTokens,
        uniqueAddresses,
        topToken,
        transfers: transfers.map(transfer => ({
          hash: transfer.transactionHash || `tx_${transfer.id}`,
          from: transfer.from,
          to: transfer.to,
          value: transfer.value,
          tokenAddress: transfer.tokenAddress,
          timestamp: transfer.timestamp
        }))
      };
    } catch (error) {
      console.error('Error getting block details:', error);
      throw error;
    }
  }

  /**
   * Get block statistics for dashboard
   */
  async getBlockStats() {
    try {
      const [
        totalBlocks,
        latestBlock,
        totalTransactions
      ] = await Promise.all([
        // Count unique blocks
        TransferEvent.count({
          distinct: true,
          col: 'blockNumber'
        }),
        
        // Get latest block
        TransferEvent.findOne({
          order: [['blockNumber', 'DESC']],
          attributes: ['blockNumber', 'timestamp']
        }),
        
        // Total transactions
        TransferEvent.count()
      ]);

      // Calculate approximate block time (assuming 12 seconds average)
      const avgBlockTime = 12; // seconds
      
      return {
        totalBlocks,
        latestBlockNumber: latestBlock?.blockNumber || 0,
        latestBlockTimestamp: latestBlock?.timestamp,
        avgTransactionsPerBlock: Math.round(totalTransactions / (totalBlocks || 1)),
        avgBlockTime,
        totalTransactions
      };
    } catch (error) {
      console.error('Error getting block stats:', error);
      throw error;
    }
  }

  /**
   * Search blocks by number or hash
   */
  async searchBlocks(query: string) {
    try {
      let blockNumber: number | null = null;

      // Try to parse as block number
      if (/^\d+$/.test(query)) {
        blockNumber = parseInt(query);
      }
      // Try to extract block number from hash-like input
      else if (query.startsWith('0x')) {
        const hex = query.slice(2);
        if (/^[0-9a-fA-F]+$/.test(hex)) {
          blockNumber = parseInt(hex, 16);
        }
      }

      if (blockNumber === null) {
        return [];
      }

      // Find blocks near the searched number
      const blocks = await this.getBlockSummaries(10);
      return blocks.filter(block => 
        Math.abs(block.number - blockNumber!) <= 5
      );
    } catch (error) {
      console.error('Error searching blocks:', error);
      throw error;
    }
  }

  /**
   * Get blocks with pagination and filtering
   */
  async getBlocksPaginated(options: {
    page?: number;
    limit?: number;
    minTransactions?: number;
    maxTransactions?: number;
    dateRange?: string;
  } = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        minTransactions,
        maxTransactions,
        dateRange
      } = options;

      // Build where clause for filters
      let whereClause: any = {};
      
      if (dateRange && dateRange !== 'all') {
        const now = new Date();
        const cutoff = new Date();
        
        switch (dateRange) {
          case '24h':
            cutoff.setHours(now.getHours() - 24);
            break;
          case '7d':
            cutoff.setDate(now.getDate() - 7);
            break;
          case '30d':
            cutoff.setDate(now.getDate() - 30);
            break;
        }
        
        whereClause.timestamp = {
          [Op.gte]: cutoff
        };
      }

      // Get all blocks first
      const allBlocks = await this.getBlockSummaries(limit * 10); // Get more to filter

      // Apply filters
      let filteredBlocks = allBlocks;

      if (minTransactions !== undefined) {
        filteredBlocks = filteredBlocks.filter(block => 
          block.transactions >= minTransactions
        );
      }

      if (maxTransactions !== undefined) {
        filteredBlocks = filteredBlocks.filter(block => 
          block.transactions <= maxTransactions
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBlocks = filteredBlocks.slice(startIndex, endIndex);

      return {
        blocks: paginatedBlocks,
        pagination: {
          page,
          limit,
          total: filteredBlocks.length,
          totalPages: Math.ceil(filteredBlocks.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting paginated blocks:', error);
      throw error;
    }
  }
}

export default new BlocksStatsService();