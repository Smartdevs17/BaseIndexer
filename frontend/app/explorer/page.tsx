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
  Globe,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import TransactionList from '@/components/indexer/TransactionList'
import BlockList from '@/components/indexer/BlockList'
import SearchBar from '@/components/indexer/SearchBar'
import Navbar from '@/components/layout/Navbar'
import { useExplorer, formatNumber, getTokenSymbol, formatTokenAddress } from '@/hooks/useExplorer'

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(30)

  // Use the real data hook
  const { 
    data: explorerData, 
    loading, 
    error, 
    refetch,
    networkStats,
    recentActivity,
    topTokens,
    trendingTokens
  } = useExplorer()

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    setSearchQuery(query)
    
    // Simulate search delay - replace with actual search logic
    setTimeout(() => {
      setIsSearching(false)
      console.log('Searching for:', query)
    }, 1000)
  }, [])

  const refreshData = useCallback(async () => {
    setTimeUntilRefresh(30)
    await refetch()
    console.log('Refreshing explorer data...')
  }, [refetch])

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

  // Prepare network stats for display
  const displayNetworkStats = networkStats ? {
    totalTransactions: formatNumber(networkStats.totalTransfers),
    totalBlocks: formatNumber(networkStats.uniqueBlocks),
    activeAddresses: formatNumber(networkStats.uniqueAddresses),
    totalTokens: formatNumber(networkStats.uniqueTokens),
    recentActivity: formatNumber(networkStats.recentActivity)
  } : {
    totalTransactions: '0',
    totalBlocks: '0', 
    activeAddresses: '0',
    totalTokens: '0',
    recentActivity: '0'
  }

  // Convert real token data to trending format for UI compatibility
  const displayTrendingTokens = trendingTokens.map(token => ({
    symbol: getTokenSymbol(token.address),
    address: token.address,
    change: `+${token.recentTransfers}`, // Show recent transfer count as "change"
    volume: `${token.recentTransfers} transfers`,
    positive: true
  }))

  // Transform recent activity data for components
  const recentTransactions = recentActivity.slice(0, 10).map(activity => ({
    id: activity.id,
    hash: activity.transactionHash || `tx_${activity.id}`,
    from: activity.from,
    to: activity.to,
    value: `${activity.value} ${getTokenSymbol(activity.tokenAddress)}`,
    timestamp: activity.timestamp,
    status: 'success' as const, // Assuming all indexed transfers are successful
    blockNumber: activity.blockNumber,
    gasUsed: Math.floor(Math.random() * 50000) + 21000, // Mock gas data for now
    gasPrice: '0.00000001 ETH', // Mock gas price
    tokenAddress: activity.tokenAddress
  }))

  // Create mock blocks from unique block numbers in recent activity
  const uniqueBlockNumbers = [...new Set(recentActivity.map(a => a.blockNumber))]
    .sort((a, b) => b - a)
    .slice(0, 10)

  const recentBlocks = uniqueBlockNumbers.map(blockNumber => {
    const blockTransactions = recentActivity.filter(a => a.blockNumber === blockNumber)
    const latestTx = blockTransactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0]

    return {
      number: blockNumber,
      hash: `0x${blockNumber.toString(16).padStart(64, '0')}`,
      timestamp: latestTx?.timestamp || new Date().toISOString(),
      transactions: blockTransactions.length,
      validator: `0xvalidator${blockNumber.toString().slice(-10)}`,
      gasUsed: `${(blockTransactions.length * 0.5).toFixed(1)}M`,
      gasLimit: '10.0M',
      baseFeePerGas: 0.00000001,
      reward: (blockTransactions.length * 0.01).toFixed(4),
      size: blockTransactions.length * 500 + 50000
    }
  })

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

          {/* Status and Refresh */}
          <motion.div 
            className="flex justify-between items-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              {error && (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm">API Connection Error - Using cached data</span>
                </div>
              )}
              {!error && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm">Live Data Connected</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Next refresh: {timeUntilRefresh}s
              </span>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-base-blue-600 text-white rounded-lg hover:bg-base-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
      <SearchBar
  onSearch={handleSearch}
  isSearching={isSearching}
  value={searchQuery}
  onChange={e => setSearchQuery(e.target.value)}
  loading={loading}
  placeholder="Search by transaction hash, address, block number, or token..."
/>
          </motion.div>

          {/* Network Statistics Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Transfers</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : displayNetworkStats.totalTransactions}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-base-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Unique Blocks</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : displayNetworkStats.totalBlocks}
                  </p>
                </div>
                <Database className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Addresses</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : displayNetworkStats.activeAddresses}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Unique Tokens</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : displayNetworkStats.totalTokens}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Recent Activity</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : displayNetworkStats.recentActivity}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          {/* Trending Tokens */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trending Tokens</h2>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                  Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded mb-2"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded"></div>
                    </div>
                  ))
                ) : (
                  displayTrendingTokens.slice(0, 4).map((token, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{token.symbol}</span>
                        <span className={`text-sm flex items-center ${
                          token.positive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {token.positive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                          {token.change}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{token.volume}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-mono">
                        {formatTokenAddress(token.address)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
                    <Link href="/transactions" className="text-base-blue-600 hover:text-base-blue-700 text-sm font-medium">
                      View All →
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <TransactionList 
                      transactions={recentTransactions}
                      loading={loading}
                      showPagination={false}
                    />
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recent Blocks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Blocks</h2>
                    <Link href="/blocks" className="text-base-blue-600 hover:text-base-blue-700 text-sm font-medium">
                      View All →
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <BlockList 
                      blocks={recentBlocks}
                      loading={loading}
                      showPagination={false}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}