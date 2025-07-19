// backend/src/controllers/analyticsService.ts - POSTGRESQL FIX
import TransferEvent from '../models/TransferEvent';
import { Op, fn, col, literal, Sequelize } from 'sequelize';

interface NetworkMetrics {
  totalTransactions: number;
  totalValue: number;
  activeAddresses: number;
  avgBlockTime: number;
  totalBlocks: number;
  tps: number;
  totalGasUsed: number;
  change24h: {
    transactions: number;
    value: number;
    addresses: number;
    tps: number;
  };
}

interface TransactionVolumeData {
  time: string;
  transactions: number;
  volume: number;
  gasUsed: number;
  timestamp: string;
}

interface TokenDistribution {
  name: string;
  symbol: string;
  value: number;
  volume: number;
  color: string;
  address: string;
  transferCount: number;
}

interface GasData {
  date: string;
  avgGasPrice: string;
  gasUsed: number;
  blockCount: number;
}

interface TopToken {
  symbol: string;
  address: string;
  volume: number;
  transactions: number;
  uniqueAddresses: number;
  avgTransferValue: number;
  change24h: number;
}

class AnalyticsService {
  /**
   * Get comprehensive network metrics
   */
  async getNetworkMetrics(): Promise<NetworkMetrics> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get current metrics - simplified approach
      const [
        totalTransactions,
        uniqueAddresses,
        uniqueBlocks,
        oldestTransfer,
        latestTransfer,
        transactions24h,
        uniqueAddresses24h
      ] = await Promise.all([
        // Total transactions
        TransferEvent.count(),

        // Unique addresses (approximate - union of from and to)
        Promise.all([
          TransferEvent.count({ distinct: true, col: 'from' }),
          TransferEvent.count({ distinct: true, col: 'to' })
        ]).then(([fromCount, toCount]) => Math.max(fromCount, toCount)),
        
        // Unique blocks
        TransferEvent.count({ distinct: true, col: 'blockNumber' }),
        
        // Oldest transfer for time calculation
        TransferEvent.findOne({
          order: [['timestamp', 'ASC']],
          attributes: ['timestamp']
        }),
        
        // Latest transfer
        TransferEvent.findOne({
          order: [['timestamp', 'DESC']],
          attributes: ['timestamp']
        }),
        
        // 24h metrics
        TransferEvent.count({
          where: { timestamp: { [Op.gte]: yesterday } }
        }),
        
        Promise.all([
          TransferEvent.count({ 
            distinct: true, 
            col: 'from',
            where: { timestamp: { [Op.gte]: yesterday } }
          }),
          TransferEvent.count({ 
            distinct: true, 
            col: 'to',
            where: { timestamp: { [Op.gte]: yesterday } }
          })
        ]).then(([fromCount, toCount]) => Math.max(fromCount, toCount))
      ]);

      // Calculate total value separately with correct PostgreSQL syntax
      const totalValueResult = await TransferEvent.findAll({
        attributes: [
          [literal('SUM(CAST(value AS DECIMAL))'), 'total']
        ],
        raw: true
      });

      const value24hResult = await TransferEvent.findAll({
        attributes: [
          [literal('SUM(CAST(value AS DECIMAL))'), 'total']
        ],
        where: { timestamp: { [Op.gte]: yesterday } },
        raw: true
      });

      const totalValue = parseFloat((totalValueResult[0] as any)?.total || '0');
      const value24h = parseFloat((value24hResult[0] as any)?.total || '0');

      // Calculate time span and TPS
      const timeSpanMs = latestTransfer && oldestTransfer 
        ? new Date(latestTransfer.timestamp).getTime() - new Date(oldestTransfer.timestamp).getTime()
        : 86400000; // Default to 1 day
      
      const timeSpanSeconds = Math.max(1, timeSpanMs / 1000);
      const avgTps = totalTransactions / timeSpanSeconds;
      const tps24h = transactions24h / (24 * 60 * 60);
      
      // Calculate average block time (assuming 12 seconds default)
      const avgBlockTime = uniqueBlocks > 1 ? timeSpanSeconds / uniqueBlocks : 12;
      
      // Estimate gas usage (mock calculation)
      const totalGasUsed = totalTransactions * 21000; // Standard ERC-20 transfer gas

      // Calculate 24h changes (percentage)
      const previousDayTransactions = Math.max(1, totalTransactions - transactions24h);
      const previousDayValue = Math.max(1, totalValue - value24h);
      const previousDayAddresses = Math.max(1, uniqueAddresses - uniqueAddresses24h);
      const previousDayTps = Math.max(0.001, avgTps - tps24h);

      return {
        totalTransactions,
        totalValue,
        activeAddresses: uniqueAddresses,
        avgBlockTime,
        totalBlocks: uniqueBlocks,
        tps: avgTps,
        totalGasUsed,
        change24h: {
          transactions: ((transactions24h / previousDayTransactions) * 100),
          value: ((value24h / previousDayValue) * 100),
          addresses: ((uniqueAddresses24h / previousDayAddresses) * 100),
          tps: ((tps24h / previousDayTps) * 100)
        }
      };
    } catch (error) {
      console.error('Error getting network metrics:', error);
      throw error;
    }
  }

  /**
   * Get transaction volume data over time
   */
  async getTransactionVolumeData(timeRange: string = '24h'): Promise<TransactionVolumeData[]> {
    try {
      let startDate = new Date();
      let points = 24;

      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          points = 7;
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          points = 30;
          break;
        default: // 24h
          startDate.setHours(startDate.getHours() - 24);
          points = 24;
      }

      // Simplified approach - get data by hour/day buckets
      const result: TransactionVolumeData[] = [];
      
      for (let i = 0; i < points; i++) {
        const periodStart = new Date(startDate);
        const periodEnd = new Date(startDate);
        
        if (timeRange === '24h') {
          periodStart.setHours(startDate.getHours() + i);
          periodEnd.setHours(startDate.getHours() + i + 1);
        } else {
          periodStart.setDate(startDate.getDate() + i);
          periodEnd.setDate(startDate.getDate() + i + 1);
        }

        // Get transactions for this period
        const transactions = await TransferEvent.count({
          where: {
            timestamp: {
              [Op.gte]: periodStart,
              [Op.lt]: periodEnd
            }
          }
        });

        // Get volume for this period with correct PostgreSQL syntax
        const volumeResult = await TransferEvent.findAll({
          attributes: [
            [literal('SUM(CAST(value AS DECIMAL))'), 'total']
          ],
          where: {
            timestamp: {
              [Op.gte]: periodStart,
              [Op.lt]: periodEnd
            }
          },
          raw: true
        });

        const volume = parseFloat((volumeResult[0] as any)?.total || '0');

        result.push({
          time: timeRange === '24h' 
            ? periodStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : periodStart.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          transactions,
          volume,
          gasUsed: transactions * 21000,
          timestamp: periodStart.toISOString()
        });
      }

      return result;
    } catch (error) {
      console.error('Error getting transaction volume data:', error);
      throw error;
    }
  }

  /**
   * Get token distribution data
   */
  async getTokenDistribution(): Promise<TokenDistribution[]> {
    try {
      // Get token stats with raw SQL to avoid Sequelize issues
      const tokenStats = await TransferEvent.findAll({
        attributes: [
          'tokenAddress',
          [fn('COUNT', col('id')), 'transferCount']
        ],
        group: ['tokenAddress'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      const totalTransfers = await TransferEvent.count();
      const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'];

      // Token symbol mapping
      const tokenMapping: { [key: string]: string } = {
        '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
        '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
        '0x514910771af9ca656af840dff83e8264ecf986ca': 'LINK',
        '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'UNI'
      };

      // Get volume for each token separately with correct PostgreSQL syntax
      const tokensWithVolume = await Promise.all(
        tokenStats.map(async (token: any, index: number) => {
          const volumeResult = await TransferEvent.findAll({
            attributes: [
              [literal('SUM(CAST(value AS DECIMAL))'), 'total']
            ],
            where: { tokenAddress: token.tokenAddress },
            raw: true
          });

          const transferCount = parseInt(token.transferCount);
          const totalValue = parseFloat((volumeResult[0] as any)?.total || '0');
          const percentage = (transferCount / totalTransfers) * 100;
          const address = token.tokenAddress.toLowerCase();
          
          return {
            name: tokenMapping[address] || `Token ${index + 1}`,
            symbol: tokenMapping[address] || `T${index + 1}`,
            value: percentage,
            volume: totalValue,
            color: colors[index % colors.length],
            address: token.tokenAddress,
            transferCount
          };
        })
      );

      return tokensWithVolume;
    } catch (error) {
      console.error('Error getting token distribution:', error);
      throw error;
    }
  }

  /**
   * Get gas usage trends
   */
  async getGasData(days: number = 7): Promise<GasData[]> {
    try {
      const gasData: GasData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        // Get daily transaction count and block count
        const [dailyTransactions, dailyBlocks] = await Promise.all([
          TransferEvent.count({
            where: {
              timestamp: {
                [Op.gte]: date,
                [Op.lt]: nextDate
              }
            }
          }),
          TransferEvent.count({
            distinct: true,
            col: 'blockNumber',
            where: {
              timestamp: {
                [Op.gte]: date,
                [Op.lt]: nextDate
              }
            }
          })
        ]);

        // Estimate gas price and usage
        const avgGasPrice = (Math.random() * 0.00005 + 0.00001).toFixed(8);
        const gasUsed = dailyTransactions * 21000; // Standard ERC-20 transfer gas

        gasData.push({
          date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          avgGasPrice,
          gasUsed,
          blockCount: dailyBlocks
        });
      }

      return gasData;
    } catch (error) {
      console.error('Error getting gas data:', error);
      throw error;
    }
  }

  /**
   * Get top tokens analysis
   */
  async getTopTokens(limit: number = 10): Promise<TopToken[]> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Get basic token stats
      const tokenStats = await TransferEvent.findAll({
        attributes: [
          'tokenAddress',
          [fn('COUNT', col('id')), 'transferCount']
        ],
        group: ['tokenAddress'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit,
        raw: true
      });

      // Get detailed data for each token with correct PostgreSQL syntax
      const tokensWithDetails = await Promise.all(
        tokenStats.map(async (token: any) => {
          const [volumeResult, uniqueFromResult, uniqueToResult, transfers24h] = await Promise.all([
            // Total volume and average with correct PostgreSQL syntax
            TransferEvent.findAll({
              attributes: [
                [literal('SUM(CAST(value AS DECIMAL))'), 'total'],
                [literal('AVG(CAST(value AS DECIMAL))'), 'avg']
              ],
              where: { tokenAddress: token.tokenAddress },
              raw: true
            }),
            
            // Unique senders
            TransferEvent.count({
              distinct: true,
              col: 'from',
              where: { tokenAddress: token.tokenAddress }
            }),
            
            // Unique receivers
            TransferEvent.count({
              distinct: true,
              col: 'to',
              where: { tokenAddress: token.tokenAddress }
            }),
            
            // 24h transfers
            TransferEvent.count({
              where: {
                tokenAddress: token.tokenAddress,
                timestamp: { [Op.gte]: yesterday }
              }
            })
          ]);

          const totalTransfers = parseInt(token.transferCount);
          const previousTransfers = Math.max(1, totalTransfers - transfers24h);
          const change24h = ((transfers24h / previousTransfers) * 100);

          // Token symbol mapping
          const tokenMapping: { [key: string]: string } = {
            '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
            '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
            '0x514910771af9ca656af840dff83e8264ecf986ca': 'LINK',
            '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'UNI'
          };

          const address = token.tokenAddress.toLowerCase();
          const symbol = tokenMapping[address] || 
            `${token.tokenAddress.slice(0, 6)}...${token.tokenAddress.slice(-4)}`;

          return {
            symbol,
            address: token.tokenAddress,
            volume: parseFloat((volumeResult[0] as any)?.total || '0'),
            transactions: totalTransfers,
            uniqueAddresses: Math.max(uniqueFromResult, uniqueToResult),
            avgTransferValue: parseFloat((volumeResult[0] as any)?.avg || '0'),
            change24h
          };
        })
      );

      return tokensWithDetails;
    } catch (error) {
      console.error('Error getting top tokens:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics data
   */
  async getAnalyticsData(timeRange: string = '24h') {
    try {
      const [
        networkMetrics,
        transactionVolumeData,
        tokenDistribution,
        gasData,
        topTokens
      ] = await Promise.all([
        this.getNetworkMetrics(),
        this.getTransactionVolumeData(timeRange),
        this.getTokenDistribution(),
        this.getGasData(7),
        this.getTopTokens(10)
      ]);

      return {
        networkMetrics,
        transactionVolumeData,
        tokenDistribution,
        gasData,
        topTokens,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();