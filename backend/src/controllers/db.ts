import TransferEvent from '../models/TransferEvent';
import { Op } from 'sequelize';

interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

/**
 * Service to query transfer events by address
 */
class TransferQueryService {
  /**
   * Get all transfers involving a specific address (either as sender or receiver)
   */
  async getTransfersByAddress(
    address: string,
    options: QueryOptions = {}
  ): Promise<any[]> {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'timestamp',
      sortDir = 'DESC',
    } = options;

    try {
      const transfers = await TransferEvent.findAll({
        where: {
          [Op.or]: [
            { from: address.toLowerCase() },
            { to: address.toLowerCase() },
          ],
        },
        order: [[sortBy, sortDir]],
        limit,
        offset,
      });

      return transfers;
    } catch (error) {
      console.error('Error querying transfers:', error);
      throw error;
    }
  }

  /**
   * Get transfers where the address is the sender
   */
  async getTransfersFrom(
    address: string,
    options: QueryOptions = {}
  ): Promise<any[]> {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'timestamp',
      sortDir = 'DESC',
    } = options;

    try {
      return await TransferEvent.findAll({
        where: { from: address.toLowerCase() },
        order: [[sortBy, sortDir]],
        limit,
        offset,
      });
    } catch (error) {
      console.error('Error querying outgoing transfers:', error);
      throw error;
    }
  }

  /**
   * Get transfers where the address is the receiver
   */
  async getTransfersTo(
    address: string,
    options: QueryOptions = {}
  ): Promise<any[]> {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'timestamp',
      sortDir = 'DESC',
    } = options;

    try {
      return await TransferEvent.findAll({
        where: { to: address.toLowerCase() },
        order: [[sortBy, sortDir]],
        limit,
        offset,
      });
    } catch (error) {
      console.error('Error querying incoming transfers:', error);
      throw error;
    }
  }

  /**
   * Get transfers for a specific token address
   */
  async getTransfersByToken(
    tokenAddress: string,
    options: QueryOptions = {}
  ): Promise<any[]> {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'timestamp',
      sortDir = 'DESC',
    } = options;

    try {
      return await TransferEvent.findAll({
        where: { tokenAddress: tokenAddress.toLowerCase() },
        order: [[sortBy, sortDir]],
        limit,
        offset,
      });
    } catch (error) {
      console.error('Error querying token transfers:', error);
      throw error;
    }
  }

  /**
   * Get transfers by address and token
   */
  async getTransfersByAddressAndToken(
    address: string,
    tokenAddress: string,
    options: QueryOptions = {}
  ): Promise<any[]> {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'timestamp',
      sortDir = 'DESC',
    } = options;

    try {
      return await TransferEvent.findAll({
        where: {
          [Op.or]: [
            { from: address.toLowerCase() },
            { to: address.toLowerCase() },
          ],
          tokenAddress: tokenAddress.toLowerCase(),
        },
        order: [[sortBy, sortDir]],
        limit,
        offset,
      });
    } catch (error) {
      console.error('Error querying transfers by address and token:', error);
      throw error;
    }
  }
}

export default new TransferQueryService();
