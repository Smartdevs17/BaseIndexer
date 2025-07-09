// src/controllers/dbExtended.ts
import TransferQueryService from './db';
import TransferEvent from '../models/TransferEvent';
import { Op, fn, col, literal } from 'sequelize';

class ExtendedTransferQueryService {
  // Re-export the original methods
  getTransfersByAddress = TransferQueryService.getTransfersByAddress.bind(TransferQueryService);
  getTransfersFrom = TransferQueryService.getTransfersFrom.bind(TransferQueryService);
  getTransfersTo = TransferQueryService.getTransfersTo.bind(TransferQueryService);
  getTransfersByToken = TransferQueryService.getTransfersByToken.bind(TransferQueryService);
  getTransfersByAddressAndToken = TransferQueryService.getTransfersByAddressAndToken.bind(TransferQueryService);

  // Get recent transfers
  async getRecentTransfers(options: any = {}) {
    const {
      limit = 10,
      offset = 0,
      sortBy = 'timestamp',
      sortDir = 'DESC',
    } = options;

    return await TransferEvent.findAll({
      order: [[sortBy, sortDir]],
      limit,
      offset,
    });
  }

  // Get recent blocks (group by blockNumber)
  async getRecentBlocks(options: any = {}) {
    const { limit = 10, offset = 0 } = options;

    return await TransferEvent.findAll({
      attributes: [
        [col('blockNumber'), 'blockNumber'],
        [fn('MAX', col('timestamp')), 'timestamp'],
        [fn('COUNT', col('id')), 'transactions'],
      ],
      group: ['blockNumber'],
      order: [[col('blockNumber'), 'DESC']],
      limit,
      offset,
      raw: true,
    });
  }

  // Get top addresses by number of transfers
  async getTopAddresses(options: any = {}) {
    const { limit = 10 } = options;

    // Top addresses by sent + received transfers
    const sent = await TransferEvent.findAll({
      attributes: [
        ['from', 'address'],
        [fn('COUNT', col('from')), 'count'],
      ],
      group: ['from'],
      order: [[literal('count'), 'DESC']],
      limit,
      raw: true,
    });

    const received = await TransferEvent.findAll({
      attributes: [
        ['to', 'address'],
        [fn('COUNT', col('to')), 'count'],
      ],
      group: ['to'],
      order: [[literal('count'), 'DESC']],
      limit,
      raw: true,
    });

    // Merge and sort by count
    const addressMap: Record<string, number> = {};
    sent.forEach((row: any) => {
      addressMap[row.address] = (addressMap[row.address] || 0) + Number(row.count);
    });
    received.forEach((row: any) => {
      addressMap[row.address] = (addressMap[row.address] || 0) + Number(row.count);
    });

    const merged = Object.entries(addressMap)
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return merged;
  }

  // Get network stats
  async getStats() {
    // Example stats: total transfers, unique addresses, latest block
    const totalTransfers = await TransferEvent.count();
    const fromCount = Number(await TransferEvent.aggregate('from', 'count', { distinct: true }));
    const toCount = Number(await TransferEvent.aggregate('to', 'count', { distinct: true }));
    const uniqueAddresses = fromCount + toCount;
    const latestBlock = await TransferEvent.max('blockNumber');

    return {
      totalTransfers,
      uniqueAddresses,
      latestBlock,
    };
  }
}

export default new ExtendedTransferQueryService();