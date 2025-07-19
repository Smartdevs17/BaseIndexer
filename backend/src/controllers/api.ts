import express, { Request, Response } from 'express';
import TransferQueryService from './db';
import ExtendedTransferQueryService from './dbExtended';
import ExplorerStatsService from './explorerStats'; // Add this line


const router = express.Router();

interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

const parseQueryOptions = (query: any): QueryOptions => {
  let sortDir: 'ASC' | 'DESC' | undefined;
  if (typeof query.sortDir === 'string') {
    const dir = query.sortDir.toUpperCase();
    if (dir === 'ASC' || dir === 'DESC') {
      sortDir = dir;
    }
  }
  return {
    limit: query.limit ? parseInt(query.limit) : 100,
    offset: query.offset ? parseInt(query.offset) : 0,
    sortBy: typeof query.sortBy === 'string' ? query.sortBy : 'timestamp',
    sortDir,
  };
};

/**
 * GET /api/transfers/:address
 * Get all transfers involving an address (both sent and received)
 */
router.get('/transfers/:address', async (req: Request, res: Response) => {
  try {
    const address: string = req.params.address;
    const options = parseQueryOptions(req.query);

    const transfers = await TransferQueryService.getTransfersByAddress(address, options);
    res.json({ success: true, data: transfers, count: transfers.length });
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/transfers/:address/from
 * Get transfers sent from an address
 */
router.get('/transfers/:address/from', async (req: Request, res: Response) => {
  try {
    const address: string = req.params.address;
    const options = parseQueryOptions(req.query);

    const transfers = await TransferQueryService.getTransfersFrom(address, options);
    res.json({ success: true, data: transfers, count: transfers.length });
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/transfers/:address/to
 * Get transfers received by an address
 */
router.get('/transfers/:address/to', async (req: Request, res: Response) => {
  try {
    const address: string = req.params.address;
    const options = parseQueryOptions(req.query);

    const transfers = await TransferQueryService.getTransfersTo(address, options);
    res.json({ success: true, data: transfers, count: transfers.length });
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/tokens/:tokenAddress/transfers
 * Get transfers for a specific token 0xdac17f958d2ee523a2206206994597c13d831ec7
 */
router.get(
  '/baseindex/:address',
  (async (req: Request, res: Response): Promise<void> => {
    try {
      const tokenAddress: string = req.params.address;
      const options = parseQueryOptions(req.query);

      const transfers = await TransferQueryService.getTransfersByToken(tokenAddress, options);
      if (!transfers || transfers.length === 0) {
        res.status(200).send({
          success: true,
          data: [],
          message: `No record found for the address ${tokenAddress}`,
          queryType: 'address',
        });
        return;
      }
      res.json({ success: true, data: transfers, count: transfers.length });
    } catch (error: any) {
      console.error('API error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }) as express.RequestHandler
);

/**
 * GET /api/addresses/:address/tokens/:tokenAddress/transfers
 * Get transfers for a specific address and token
 */
router.get('/addresses/:address/tokens/:tokenAddress/transfers', async (req: Request, res: Response) => {
  try {
    const { address, tokenAddress } = req.params;
    const options = parseQueryOptions(req.query);

    const transfers = await TransferQueryService.getTransfersByAddressAndToken(address, tokenAddress, options);
    res.json({ success: true, data: transfers, count: transfers.length });
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recent transfers
router.get('/transfers/recent', async (req: Request, res: Response) => {
  try {
    const options = parseQueryOptions(req.query);
    const transfers = await ExtendedTransferQueryService.getRecentTransfers(options);
    res.json({ success: true, data: transfers, count: transfers.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recent blocks
router.get('/blocks/recent', async (req: Request, res: Response) => {
  try {
    const options = parseQueryOptions(req.query);
    const blocks = await ExtendedTransferQueryService.getRecentBlocks(options);
    res.json({ success: true, data: blocks, count: blocks.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Top addresses
router.get('/addresses/top', async (req: Request, res: Response) => {
  try {
    const options = parseQueryOptions(req.query);
    const addresses = await ExtendedTransferQueryService.getTopAddresses(options);
    res.json({ success: true, data: addresses, count: addresses.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Alias for network stats
router.get('/network/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await ExtendedTransferQueryService.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Alias for recent transactions
router.get('/transactions/recent', async (req: Request, res: Response) => {
  try {
    const options = parseQueryOptions(req.query);
    const transfers = await ExtendedTransferQueryService.getRecentTransfers(options);
    res.json({ success: true, data: transfers, count: transfers.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Address details
router.get('/addresses/:address', async (req: Request, res: Response) => {
  try {
    const address = req.params.address;
    const transfers = await TransferQueryService.getTransfersByAddress(address, { limit: 100 });
    res.json({ success: true, data: { address, transfers } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Alias for token transfers
router.get('/tokens/:tokenAddress/transfers', async (req: Request, res: Response) => {
  try {
    const tokenAddress = req.params.tokenAddress;
    const options = parseQueryOptions(req.query);
    const transfers = await TransferQueryService.getTransfersByToken(tokenAddress, options);
    res.json({ success: true, data: transfers, count: transfers.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/explorer/stats
 * Get comprehensive statistics for Explorer page
 */
router.get('/explorer/stats', async (req: Request, res: Response) => {
  try {
    const stats = await ExplorerStatsService.getExplorerStats();
    res.json({ 
      success: true, 
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Explorer stats API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      endpoint: '/api/explorer/stats'
    });
  }
});

/**
 * GET /api/explorer/network
 * Get basic network statistics
 */
router.get('/explorer/network', async (req: Request, res: Response) => {
  try {
    const networkStats = await ExplorerStatsService.getNetworkStats();
    const networkOverview = await ExplorerStatsService.getNetworkOverview();
    
    res.json({ 
      success: true, 
      data: {
        stats: networkStats,
        overview: networkOverview
      }
    });
  } catch (error: any) {
    console.error('Network stats API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/explorer/activity
 * Get recent network activity
 */
router.get('/explorer/activity', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const activity = await ExplorerStatsService.getRecentActivity(limit);
    
    res.json({ 
      success: true, 
      data: activity,
      count: activity.length
    });
  } catch (error: any) {
    console.error('Activity API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/explorer/tokens/top
 * Get top tokens by transfer count
 */
router.get('/explorer/tokens/top', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const topTokens = await ExplorerStatsService.getTopTokens(limit);
    
    res.json({ 
      success: true, 
      data: topTokens,
      count: topTokens.length
    });
  } catch (error: any) {
    console.error('Top tokens API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/explorer/tokens/trending
 * Get trending tokens (most active recently)
 */
router.get('/explorer/tokens/trending', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const trendingTokens = await ExplorerStatsService.getTrendingTokens(limit);
    
    res.json({ 
      success: true, 
      data: trendingTokens,
      count: trendingTokens.length
    });
  } catch (error: any) {
    console.error('Trending tokens API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
