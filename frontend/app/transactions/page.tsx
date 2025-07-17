'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  X,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react'
import TransactionList from '@/components/indexer/TransactionList'
import SearchBar from '@/components/indexer/SearchBar'
import ExportButton from '@/components/indexer/ExportButton'

interface TransactionFilters {
  dateRange: 'all' | '24h' | '7d' | '30d' | 'custom'
  minValue: string
  maxValue: string
  status: 'all' | 'success' | 'failed' | 'pending'
  tokenAddress: string
  fromAddress: string
  toAddress: string
}

// Mock transactions data - replace with real API
const generateMockTransactions = (count: number) => {
  const tokens = ['USDT', 'USDC', 'WETH', 'DAI', 'LINK', 'UNI']
  const statuses = ['success', 'failed', 'pending'] as const
  
  return Array.from({ length: count }, (_, i) => ({
    id: `tx_${i + 1}`,
    hash: `0x${Math.random().toString(16).substr(2, 40)}`,
    from: `0x${Math.random().toString(16).substr(2, 40)}`,
    to: `0x${Math.random().toString(16).substr(2, 40)}`,
    value: `${(Math.random() * 10000).toFixed(2)} ${tokens[Math.floor(Math.random() * tokens.length)]}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    blockNumber: 18294 - Math.floor(Math.random() * 1000),
    gasUsed: Math.floor(Math.random() * 100000) + 21000,
    gasPrice: (Math.random() * 0.00001).toFixed(8) + ' ETH',
    tokenAddress: `0x${Math.random().toString(16).substr(2, 40)}`
  }))
}

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: 'all',
    minValue: '',
    maxValue: '',
    status: 'all',
    tokenAddress: '',
    fromAddress: '',
    toAddress: ''
  })

  // Mock data
  const [allTransactions] = useState(() => generateMockTransactions(1000))
  
  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tx => 
        tx.hash.toLowerCase().includes(query) ||
        tx.from.toLowerCase().includes(query) ||
        tx.to.toLowerCase().includes(query) ||
        tx.value.toLowerCase().includes(query)
      )
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const cutoff = new Date()
      
      switch (filters.dateRange) {
        case '24h':
          cutoff.setHours(now.getHours() - 24)
          break
        case '7d':
          cutoff.setDate(now.getDate() - 7)
          break
        case '30d':
          cutoff.setDate(now.getDate() - 30)
          break
      }
      
      filtered = filtered.filter(tx => new Date(tx.timestamp) >= cutoff)
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(tx => tx.status === filters.status)
    }

    // Address filters
    if (filters.fromAddress) {
      filtered = filtered.filter(tx => 
        tx.from.toLowerCase().includes(filters.fromAddress.toLowerCase())
      )
    }
    
    if (filters.toAddress) {
      filtered = filtered.filter(tx => 
        tx.to.toLowerCase().includes(filters.toAddress.toLowerCase())
      )
    }

    // Value range filters
    if (filters.minValue || filters.maxValue) {
      filtered = filtered.filter(tx => {
        const value = parseFloat(tx.value.split(' ')[0])
        const min = filters.minValue ? parseFloat(filters.minValue) : 0
        const max = filters.maxValue ? parseFloat(filters.maxValue) : Infinity
        return value >= min && value <= max
      })
    }

    return filtered
  }, [allTransactions, searchQuery, filters])

  // Statistics
  const stats = useMemo(() => {
    const totalValue = filteredTransactions.reduce((sum, tx) => {
      const value = parseFloat(tx.value.split(' ')[0])
      return sum + (isNaN(value) ? 0 : value)
    }, 0)
    
    const successfulTxs = filteredTransactions.filter(tx => tx.status === 'success').length
    const avgGasUsed = filteredTransactions.reduce((sum, tx) => sum + tx.gasUsed, 0) / filteredTransactions.length || 0
    
    return {
      totalTransactions: filteredTransactions.length,
      totalValue: totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      successRate: ((successfulTxs / filteredTransactions.length) * 100).toFixed(1),
      avgGasUsed: Math.round(avgGasUsed).toLocaleString()
    }
  }, [filteredTransactions])

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true)
    setSearchQuery(query)
    setCurrentPage(1)
    
    // Mock search delay
    setTimeout(() => {
      setIsSearching(false)
    }, 500)
  }, [])

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      dateRange: 'all',
      minValue: '',
      maxValue: '',
      status: 'all',
      tokenAddress: '',
      fromAddress: '',
      toAddress: ''
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    setLastRefresh(new Date())
    
    // Mock refresh delay
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Transactions
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Explore all transactions on the Base network with advanced filtering and search
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-base-blue-600 text-white rounded-lg hover:bg-base-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <ExportButton 
                data={filteredTransactions}
                filename="transactions"
              />
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTransactions.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalValue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.successRate}%</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Gas Used</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgGasUsed}</p>
              </div>
              <ArrowUpDown className="w-8 h-8 text-amber-500" />
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              isSearching={isSearching}
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
              <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {(searchQuery || Object.values(filters).some(v => v !== 'all' && v !== '')) && (
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Min Value */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Min Value
                  </label>
                  <input
                    type="number"
                    value={filters.minValue}
                    onChange={(e) => handleFilterChange('minValue', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                  />
                </div>

                {/* Max Value */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Max Value
                  </label>
                  <input
                    type="number"
                    value={filters.maxValue}
                    onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                    placeholder="∞"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                  />
                </div>

                {/* From Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    From Address
                  </label>
                  <input
                    type="text"
                    value={filters.fromAddress}
                    onChange={(e) => handleFilterChange('fromAddress', e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                  />
                </div>

                {/* To Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    To Address
                  </label>
                  <input
                    type="text"
                    value={filters.toAddress}
                    onChange={(e) => handleFilterChange('toAddress', e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Info */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-slate-600 dark:text-slate-400">
            Showing {filteredTransactions.length.toLocaleString()} transactions
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <TransactionList 
            transactions={filteredTransactions}
            showPagination={true}
            showAll={true}
          />
        </motion.div>
      </div>
    </div>
  )
}