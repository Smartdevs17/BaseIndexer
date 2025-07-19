'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  RefreshCw, 
  Download, 
  Filter,
  Clock,
  Activity,
  Database,
  Zap,
  TrendingUp,
  ChevronDown,
  X,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import BlockList from '@/components/indexer/BlockList'
import SearchBar from '@/components/indexer/SearchBar'
import ExportButton from '@/components/indexer/ExportButton'
import Navbar from '@/components/layout/Navbar'
import { useBlocks } from '@/hooks/useBlocks'

export default function BlocksPage() {
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // Use the real data hook
  const {
    blocks,
    filteredBlocks,
    loading,
    error,
    stats,
    refetch,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    clearFilters,
    pagination,
    currentPage,
    setCurrentPage,
    searchBlocks
  } = useBlocks({ limit: 50, autoRefresh: true })

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true)
    setSearchQuery(query)
    
    if (query.trim()) {
      // If it's a specific search, use the search API
      const searchResults = await searchBlocks(query)
      console.log('Search results:', searchResults)
    }
    
    setTimeout(() => {
      setIsSearching(false)
    }, 500)
  }, [setSearchQuery, searchBlocks])

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const refreshData = useCallback(async () => {
    await refetch()
  }, [refetch])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  // Prepare export data
  const exportData = filteredBlocks.map(block => ({
    'Block Number': block.number,
    'Block Hash': block.hash,
    'Timestamp': block.timestamp,
    'Transactions': block.transactions,
    'Validator': block.validator,
    'Gas Used': block.gasUsed,
    'Gas Limit': block.gasLimit,
    'Total Value': block.totalValue,
    'Unique Tokens': block.uniqueTokens,
    'Top Token': block.topToken
  }))

  return (
    <>
      <Navbar />
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
                  Blocks
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Explore blockchain blocks aggregated from ERC-20 transfer activity
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                {error && (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">Connection Error</span>
                  </div>
                )}
                {!error && (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">Live Data</span>
                  </div>
                )}
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-base-blue-600 text-white rounded-lg hover:bg-base-blue-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
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
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Blocks</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : stats?.totalBlocks?.toLocaleString() || '0'}
                  </p>
                </div>
                <Database className="h-8 w-8 text-base-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Latest Block</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : stats?.latestBlockNumber?.toLocaleString() || '0'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Transactions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : stats?.avgTransactionsPerBlock?.toFixed(1) || '0'}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Block Time</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : `${stats?.avgBlockTime || 12}s`}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="mb-8 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Search Bar */}
            <SearchBar
              onSearch={handleSearch}
              isSearching={isSearching}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              loading={loading}
              placeholder="Search by block number, hash, or validator..."
            />

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {(searchQuery || Object.values(filters).some(v => v !== 'all' && v !== '')) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              )}

              <ExportButton
                data={exportData}
                filename="blocks"
              />
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Block Range
                    </label>
                    <select
                      value={filters.blockRange}
                      onChange={(e) => handleFilterChange('blockRange', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="all">All Time</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Validator
                    </label>
                    <input
                      type="text"
                      value={filters.validator}
                      onChange={(e) => handleFilterChange('validator', e.target.value)}
                      placeholder="0xvalidator..."
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Min Transactions
                      </label>
                      <input
                        type="number"
                        value={filters.minTransactions}
                        onChange={(e) => handleFilterChange('minTransactions', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Max Transactions
                      </label>
                      <input
                        type="number"
                        value={filters.maxTransactions}
                        onChange={(e) => handleFilterChange('maxTransactions', e.target.value)}
                        placeholder="∞"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Min Gas Used (M)
                      </label>
                      <input
                        type="number"
                        value={filters.minGasUsed}
                        onChange={(e) => handleFilterChange('minGasUsed', e.target.value)}
                        placeholder="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Max Gas Used (M)
                      </label>
                      <input
                        type="number"
                        value={filters.maxGasUsed}
                        onChange={(e) => handleFilterChange('maxGasUsed', e.target.value)}
                        placeholder="∞"
                        step="0.1"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results Info */}
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {pagination && (
                <>
                  Showing {Math.min((currentPage - 1) * pagination.limit + 1, pagination.total)} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} blocks
                </>
              )}
            </div>
            
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Page:</span>
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="px-3 py-1 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm"
                >
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-600 dark:text-slate-400">of {pagination.totalPages}</span>
              </div>
            )}
          </motion.div>

          {/* Blocks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <BlockList 
                blocks={filteredBlocks}
                loading={loading}
                showPagination={false}
                showAll={true}
              />
            </div>
          </motion.div>

          {/* Latest Block Highlight */}
          {stats && !loading && (
            <motion.div
              className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Latest Indexed Block
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Block Number: </span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {stats.latestBlockNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Total Transactions: </span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {stats.totalTransactions.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Avg Block Time: </span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {stats.avgBlockTime}s
                      </span>
                    </div>
                  </div>
                </div>
                <Zap className="h-12 w-12 text-green-600" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}