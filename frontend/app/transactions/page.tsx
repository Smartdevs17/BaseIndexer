'use client'

import { useState, useCallback } from 'react'
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
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react'
import TransactionList from '@/components/indexer/TransactionList'
import SearchBar from '@/components/indexer/SearchBar'
import ExportButton from '@/components/indexer/ExportButton'
import Navbar from '@/components/layout/Navbar'
import { useTransactions } from '@/hooks/useTransactions'
import { formatTokenAmount } from '@/lib/utils'

export default function TransactionsPage() {
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Use the real data hook
  const {
    transactions,
    filteredTransactions,
    loading,
    error,
    stats,
    refetch,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    clearFilters,
    totalCount,
    currentPage,
    setCurrentPage
  } = useTransactions({ limit: 200, autoRefresh: true })

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true)
    setSearchQuery(query)
    
    // Add slight delay for UX
    setTimeout(() => {
      setIsSearching(false)
    }, 500)
  }, [setSearchQuery])

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const refreshData = useCallback(async () => {
    await refetch()
  }, [refetch])

  // Paginate filtered transactions
  const itemsPerPage = 20
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  // Prepare export data
  const exportData = filteredTransactions.map(tx => ({
    Hash: tx.hash,
    From: tx.from,
    To: tx.to,
    Value: tx.value,
    'Block Number': tx.blockNumber,
    Timestamp: tx.timestamp,
    Status: tx.status,
    'Gas Used': tx.gasUsed,
    'Gas Price': tx.gasPrice
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
                  Transactions
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Explore all ERC-20 transfer transactions with advanced filtering and search
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : stats.totalTransactions.toLocaleString()}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-base-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Value</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : `${formatTokenAmount(stats.totalValue)} tokens`}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : `${stats.successRate}%`}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Gas Used</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : stats.avgGasUsed}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
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
              onChange={e => setSearchQuery(e.target.value)}
              loading={isSearching}
              placeholder="Search by hash, address, or token..."
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
                filename="transactions"
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
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
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
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Token Address
                    </label>
                    <input
                      type="text"
                      value={filters.tokenAddress}
                      onChange={(e) => handleFilterChange('tokenAddress', e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      From Address
                    </label>
                    <input
                      type="text"
                      value={filters.fromAddress}
                      onChange={(e) => handleFilterChange('fromAddress', e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      To Address
                    </label>
                    <input
                      type="text"
                      value={filters.toAddress}
                      onChange={(e) => handleFilterChange('toAddress', e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Min Value
                      </label>
                      <input
                        type="number"
                        value={filters.minValue}
                        onChange={(e) => handleFilterChange('minValue', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Max Value
                      </label>
                      <input
                        type="number"
                        value={filters.maxValue}
                        onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                        placeholder="∞"
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
              Showing {Math.min(startIndex + 1, filteredTransactions.length)} - {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
              {totalCount > filteredTransactions.length && ` (filtered from ${totalCount} total)`}
            </div>
            
            {filteredTransactions.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Page:</span>
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="px-3 py-1 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-600 dark:text-slate-400">of {totalPages}</span>
              </div>
            )}
          </motion.div>

          {/* Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <TransactionList 
                transactions={paginatedTransactions}
                loading={loading}
                showPagination={true}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}