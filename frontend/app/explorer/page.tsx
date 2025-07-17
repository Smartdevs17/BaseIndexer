'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  TrendingUp, 
  Activity, 
  Clock, 
  Users, 
  Database,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import TransactionList from '@/components/indexer/TransactionList'
import BlockList from '@/components/indexer/BlockList'
import SearchBar from '@/components/indexer/SearchBar'
import Navbar from '@/components/layout/Navbar'


// Mock data - replace with real API calls
const networkStats = {
  totalTransactions: 2847293,
  totalBlocks: 18294,
  activeAddresses: 45821,
  totalValue: '$12.4B',
  avgBlockTime: '2.1s',
  networkHealth: 98.5,
  gasPrice: '0.00000001 ETH',
  marketCap: '$4.2B'
}

const trendingTokens = [
  { symbol: 'USDT', change: '+2.4%', volume: '$1.2M', positive: true },
  { symbol: 'USDC', change: '+1.8%', volume: '$890K', positive: true },
  { symbol: 'WETH', change: '-0.5%', volume: '$2.1M', positive: false },
  { symbol: 'DAI', change: '+0.9%', volume: '$340K', positive: true },
]

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(30)

  // Mock recent data - replace with real API hooks
  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: '1',
      hash: '0x1234...5678',
      from: '0xabcd...efgh',
      to: '0x9876...5432',
      value: '1000.00 USDT',
      timestamp: new Date().toISOString(),
      status: 'success' as const,
      blockNumber: 18294
    },
    {
      id: '2', 
      hash: '0x2345...6789',
      from: '0xbcde...fghi',
      to: '0x8765...4321',
      value: '500.50 USDC',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      status: 'success' as const,
      blockNumber: 18293
    },
    {
      id: '3',
      hash: '0x3456...789a', 
      from: '0xcdef...ghij',
      to: '0x7654...3210',
      value: '2.5 WETH',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'success' as const,
      blockNumber: 18292
    }
  ])

  const [recentBlocks, setRecentBlocks] = useState([
    {
      number: 18294,
      hash: '0xblock1234...5678',
      timestamp: new Date().toISOString(),
      transactions: 42,
      validator: '0xvalidator1...abc',
      gasUsed: '8.2M'
    },
    {
      number: 18293,
      hash: '0xblock2345...6789', 
      timestamp: new Date(Date.now() - 120000).toISOString(),
      transactions: 38,
      validator: '0xvalidator2...def',
      gasUsed: '7.8M'
    },
    {
      number: 18292,
      hash: '0xblock3456...789a',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      transactions: 51,
      validator: '0xvalidator3...ghi',
      gasUsed: '9.1M'
    }
  ])

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true)
    setSearchQuery(query)
    
    // Mock search delay
    setTimeout(() => {
      setIsSearching(false)
      // Handle search results
      console.log('Searching for:', query)
    }, 1000)
  }, [])

  const refreshData = useCallback(async () => {
    setLastRefresh(new Date())
    setTimeUntilRefresh(30)
    // Refresh transactions and blocks data
    console.log('Refreshing explorer data...')
  }, [])

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev <= 1) {
          refreshData()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [refreshData])

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Base Blockchain Explorer
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore transactions, blocks, addresses, and smart contracts on the Base network with real-time data and AI-powered insights.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="max-w-3xl mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                isSearching={isSearching}
              />
              <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                Search by transaction hash, block number, address, or token symbol
              </div>
            </div>
          </div>
        </motion.div>

        {/* Network Statistics */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Network Overview</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4 mr-1" />
                  Next refresh in {timeUntilRefresh}s
                </div>
                <button
                  onClick={refreshData}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Transactions</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{networkStats.totalTransactions.toLocaleString()}</p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Blocks</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{networkStats.totalBlocks.toLocaleString()}</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Addresses</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{networkStats.activeAddresses.toLocaleString()}</p>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{networkStats.totalValue}</p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Block Time</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{networkStats.avgBlockTime}</p>
              </div>
              
              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Network Health</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{networkStats.networkHealth}%</p>
              </div>
              
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gas Price</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{networkStats.gasPrice}</p>
              </div>
              
              <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Market Cap</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{networkStats.marketCap}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trending Tokens */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trending Tokens</h2>
              <Link 
                href="/tokens"
                className="text-base-blue-600 dark:text-base-blue-400 hover:text-base-blue-800 dark:hover:text-base-blue-300 text-sm font-medium flex items-center"
              >
                View all tokens <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingTokens.map((token, index) => (
                <div key={token.symbol} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">{token.symbol}</h3>
                    <div className={`flex items-center text-sm ${token.positive ? 'text-green-500' : 'text-red-500'}`}>
                      {token.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {token.change}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Volume: {token.volume}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Transactions */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                <Link 
                  href="/transactions"
                  className="text-base-blue-600 dark:text-base-blue-400 hover:text-base-blue-800 dark:hover:text-base-blue-300 text-sm font-medium flex items-center"
                >
                  View all <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-0">
              <TransactionList 
                transactions={recentTransactions}
                showPagination={false}
                showAll={false}
              />
            </div>
          </motion.div>

          {/* Recent Blocks */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Blocks</h3>
                <Link 
                  href="/blocks"
                  className="text-base-blue-600 dark:text-base-blue-400 hover:text-base-blue-800 dark:hover:text-base-blue-300 text-sm font-medium flex items-center"
                >
                  View all <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-0">
              <BlockList 
                blocks={recentBlocks}
                showAll={false}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  )
}