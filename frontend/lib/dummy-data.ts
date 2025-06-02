// src/lib/dummy-data.ts
import { 
    Transaction, 
    Block, 
    Address, 
    Token, 
    TokenTransfer,
    NetworkStats,
    ChartData
  } from './types';
  
  // Generate timestamps from last week to now
  const getRandomTimestamp = (daysAgo = 7): number => {
    const now = Date.now();
    const weekAgo = now - daysAgo * 24 * 60 * 60 * 1000;
    return weekAgo + Math.floor(Math.random() * (now - weekAgo));
  };
  
  // Generate random hex string
  const randomHex = (length: number): string => {
    return '0x' + Array(length).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  };
  
  // Transactions data
  export const transactions: Transaction[] = Array(50).fill(null).map((_, i) => ({
    hash: randomHex(64),
    blockNumber: 100000 + i,
    from: randomHex(40),
    to: randomHex(40),
    value: (Math.random() * 10).toFixed(8) + ' ETH',
    gasUsed: (Math.random() * 1000000).toFixed(0),
    gasPrice: (Math.random() * 100).toFixed(2) + ' Gwei',
    timestamp: getRandomTimestamp(),
    status: Math.random() > 0.1 ? 'success' : 'failed',
    methodId: '0x' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    functionName: ['transfer', 'swap', 'mint', 'approve', 'stake'][Math.floor(Math.random() * 5)]
  }));
  
  // Blocks data
  export const blocks: Block[] = Array(30).fill(null).map((_, i) => ({
    number: 100000 + i,
    hash: randomHex(64),
    timestamp: getRandomTimestamp(),
    transactions: Math.floor(Math.random() * 300),
    miner: randomHex(40),
    gasUsed: (Math.random() * 30000000).toFixed(0),
    gasLimit: '30000000',
    baseFeePerGas: (Math.random() * 100).toFixed(2) + ' Gwei',
    size: (Math.random() * 100000).toFixed(0) + ' bytes'
  }));
  
  // Addresses data
  export const addresses: Address[] = [
    ...Array(20).fill(null).map((_, i) => ({
      address: randomHex(40),
      balance: (Math.random() * 1000).toFixed(4) + ' ETH',
      txCount: Math.floor(Math.random() * 1000),
      type: 'wallet' as const,
      name: Math.random() > 0.7 ? `Wallet ${i + 1}` : undefined
    })),
    ...Array(10).fill(null).map((_, i) => ({
      address: randomHex(40),
      balance: (Math.random() * 1000).toFixed(4) + ' ETH',
      txCount: Math.floor(Math.random() * 5000),
      type: 'contract' as const,
      creationTx: randomHex(64),
      creator: randomHex(40),
      name: `Contract ${i + 1}`,
      verified: Math.random() > 0.5
    }))
  ];
  
  // Tokens data
  export const tokens: Token[] = Array(15).fill(null).map((_, i) => ({
    address: randomHex(40),
    name: `Token ${i + 1}`,
    symbol: `TKN${i + 1}`,
    decimals: 18,
    totalSupply: (Math.random() * 1000000000).toFixed(0),
    holders: Math.floor(Math.random() * 10000),
    type: Math.random() > 0.7 ? 'ERC721' : (Math.random() > 0.5 ? 'ERC1155' : 'ERC20') as any
  }));
  
  // Token transfers data
  export const tokenTransfers: TokenTransfer[] = Array(30).fill(null).map((_, i) => {
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    return {
      hash: randomHex(64),
      from: randomHex(40),
      to: randomHex(40),
      value: (Math.random() * 1000).toFixed(token.decimals === 18 ? 18 : 0),
      tokenAddress: token.address,
      tokenName: token.name,
      tokenSymbol: token.symbol,
      tokenDecimal: token.decimals,
      timestamp: getRandomTimestamp()
    };
  });
  
  // Network statistics
  export const networkStats: NetworkStats = {
    totalTransactions: 5482910,
    totalAddresses: 348729,
    totalBlocks: 12345678,
    averageBlockTime: 2.5,
    averageGasPrice: '25.12 Gwei',
    currentTPS: 14.5,
    dailyTransactions: 54829
  };
  
  // Chart data for analytics
  export const transactionChartData: ChartData = {
    label: 'Transactions per day',
    data: Array(14).fill(null).map((_, i) => ({
      timestamp: Date.now() - (13 - i) * 24 * 60 * 60 * 1000,
      value: 30000 + Math.floor(Math.random() * 15000)
    }))
  };
  
  export const gasChartData: ChartData = {
    label: 'Average Gas Price (Gwei)',
    data: Array(14).fill(null).map((_, i) => ({
      timestamp: Date.now() - (13 - i) * 24 * 60 * 60 * 1000,
      value: 15 + Math.floor(Math.random() * 20)
    }))
  };
  
  // Sample AI chat history
  export const sampleChatHistory = [
    {
      id: '1',
      role: 'system' as const,
      content: 'Welcome to Base Chain AI assistant. How can I help you with blockchain data?',
      timestamp: Date.now() - 1000 * 60 * 5
    },
    {
      id: '2',
      role: 'user' as const,
      content: 'What is the average gas price right now?',
      timestamp: Date.now() - 1000 * 60 * 4
    },
    {
      id: '3',
      role: 'assistant' as const,
      content: 'The current average gas price on Base Chain is 25.12 Gwei. This is relatively low compared to last week\'s average of 32.5 Gwei.',
      timestamp: Date.now() - 1000 * 60 * 3
    },
    {
      id: '4',
      role: 'user' as const,
      content: 'Can you explain what gas is?',
      timestamp: Date.now() - 1000 * 60 * 2
    },
    {
      id: '5',
      role: 'assistant' as const,
      content: 'Gas is the unit of measurement for computational work in the Base blockchain, which is an Ethereum L2 solution. When you send transactions or execute smart contracts, each operation requires gas to be executed. Gas price is how much you pay per unit of gas, typically denominated in Gwei (1 billion Gwei = 1 ETH). Higher gas prices mean your transaction will be processed faster, while lower gas prices might mean waiting longer for your transaction to be included in a block.',
      timestamp: Date.now() - 1000 * 60 * 1
    }
  ];