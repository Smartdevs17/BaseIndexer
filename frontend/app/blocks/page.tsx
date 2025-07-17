'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import BlockList from '@/components/indexer/BlockList'
import SearchBar from '@/components/indexer/SearchBar'
import ExportButton from '@/components/indexer/ExportButton'
import Navbar from '@/components/layout/Navbar'

interface BlockFilters {
  blockRange: 'all' | '24h' | '7d' | '30d'
  minTransactions: string
  maxTransactions: string
  validator: string
  minGasUsed: string
  maxGasUsed: string
}

// Mock blocks data - replace with real API
const generateMockBlocks = (count: number) => {
  const validators = [
    '0xvalidator1234567890abcdef',
    '0xvalidator2345678901bcdef0', 
    '0xvalidator3456789012cdef01',
    '0xvalidator4567890123def012',
    '0xvalidator5678901234ef0123'
  ]
  
  return Array.from({ length: count }, (_, i) => ({
    number: 18500 - i,
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    timestamp: new Date(Date.now() - i * 12000).toISOString(), // 12 seconds per block
    transactions: Math.floor(Math.random() * 200) + 10,
    validator: validators[Math.floor(Math.random() * validators.length)],
    gasUsed: `${(Math.random() * 10 + 5).toFixed(1)}M`,
    gasLimit: `${(Math.random() * 5 + 10).toFixed(1)}M`,
    baseFeePerGas: (Math.random() * 0.00001).toFixed(8),
    reward: (Math.random() * 0.1 + 0.05).toFixed(4),
    size: Math.floor(Math.random() * 100000) + 50000
  }))
}

export default function BlocksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [selectedBlock, setSelectedBlock] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<BlockFilters>({
    blockRange: 'all',
    minTransactions: '',
    maxTransactions: '',
    validator: '',
    minGasUsed: '',
    maxGasUsed: ''
  })

  // Mock data
  const [allBlocks] = useState(() => generateMockBlocks(500))
  
  // Filter and search blocks
  const filteredBlocks = useMemo(() => {
    let filtered = allBlocks

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(block => 
        block.number.toString().includes(query) ||
        block.hash.toLowerCase().includes(query) ||
        block.validator.toLowerCase().includes(query)
      )
    }

    // Block range filter
    if (filters.blockRange !== 'all') {
      const now = new Date()
      const cutoff = new Date()
      
      switch (filters.blockRange) {
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
      
      filtered = filtered.filter(block => new Date(block.timestamp) >= cutoff)
    }

    // Transaction count filters
    if (filters.minTransactions || filters.maxTransactions) {
      filtered = filtered.filter(block => {
        const txCount = block.transactions
        const min = filters.minTransactions ? parseInt(filters.minTransactions) : 0
        const max = filters.maxTransactions ? parseInt(filters.maxTransactions) : Infinity
        return txCount >= min && txCount <= max
      })
    }

    // Validator filter
    if (filters.validator) {
      filtered = filtered.filter(block => 
        block.validator.toLowerCase().includes(filters.validator.toLowerCase())
      )
    }

    // Gas used filters
    if (filters.minGasUsed || filters.maxGasUsed) {
      filtered = filtered.filter(block => {
        const gasUsed = parseFloat(block.gasUsed.replace('M', ''))
        const min = filters.minGasUsed ? parseFloat(filters.minGasUsed) : 0
        const max = filters.maxGasUsed ? parseFloat(filters.maxGasUsed) : Infinity
        return gasUsed >= min && gasUsed <= max
      })
    }

    return filtered
  }, [allBlocks, searchQuery, filters])

  // Block statistics
  const stats = useMemo(() => {
    const totalTransactions = filteredBlocks.reduce((sum, block) => sum + block.transactions, 0)
    const avgTransactions = totalTransactions / filteredBlocks.length || 0
    const avgGasUsed = filteredBlocks.reduce((sum, block) => sum + parseFloat(block.gasUsed.replace('M', '')), 0) / filteredBlocks.length || 0
    const avgBlockTime = filteredBlocks.length > 1 ? 
      (new Date(filteredBlocks[0].timestamp).getTime() - new Date(filteredBlocks[1].timestamp).getTime()) / 1000 : 12
    
    return {
      totalBlocks: filteredBlocks.length,
      totalTransactions,
      avgTransactions: Math.round(avgTransactions),
      avgGasUsed: avgGasUsed.toFixed(1),
      avgBlockTime: avgBlockTime.toFixed(1)
    }
  }, [filteredBlocks])

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true)
    setSearchQuery(query)
    
    setTimeout(() => {
      setIsSearching(false)
    }, 500)
  }, [])

  const handleFilterChange = (key: keyof BlockFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      blockRange: 'all',
      minTransactions: '',
      maxTransactions: '',
      validator: '',
      minGasUsed: '',
      maxGasUsed: ''
    })
    setSearchQuery('')
  }

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    setLastRefresh(new Date())
    
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

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
                  Explore all blocks on the Base network with detailed information and analytics
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
                  data={filteredBlocks}
                  filename="blocks"
                />
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Blocks</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalBlocks.toLocaleString()}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTransactions.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Transactions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgTransactions}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Gas Used</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgGasUsed}M</p>
                </div>
                <Zap className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Block Time</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgBlockTime}s</p>
                </div>
                <Clock className="w-8 h-8 text-red-500" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Block Range */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Block Range
                    </label>
                    <select
                      value={filters.blockRange}
                      onChange={(e) => handleFilterChange('blockRange', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                    </select>
                  </div>

                  {/* Min Transactions */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Min Transactions
                    </label>
                    <input
                      type="number"
                      value={filters.minTransactions}
                      onChange={(e) => handleFilterChange('minTransactions', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                    />
                  </div>

                  {/* Max Transactions */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Max Transactions
                    </label>
                    <input
                      type="number"
                      value={filters.maxTransactions}
                      onChange={(e) => handleFilterChange('maxTransactions', e.target.value)}
                      placeholder="∞"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                    />
                  </div>

                  {/* Validator */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Validator
                    </label>
                    <input
                      type="text"
                      value={filters.validator}
                      onChange={(e) => handleFilterChange('validator', e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                    />
                  </div>

                  {/* Min Gas Used */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Min Gas Used (M)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={filters.minGasUsed}
                      onChange={(e) => handleFilterChange('minGasUsed', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-base-blue-500"
                    />
                  </div>

                  {/* Max Gas Used */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Max Gas Used (M)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={filters.maxGasUsed}
                      onChange={(e) => handleFilterChange('maxGasUsed', e.target.value)}
                      placeholder="∞"
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
              Showing {filteredBlocks.length.toLocaleString()} blocks
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </motion.div>

          {/* Latest Block Highlight */}
          {filteredBlocks.length > 0 && (
            <motion.div
              className="bg-gradient-to-r from-base-blue-500 to-base-blue-600 rounded-xl p-6 mb-8 text-white shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Latest Block</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="opacity-80">Block Number</p>
                      <p className="font-semibold text-lg">{filteredBlocks[0].number.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="opacity-80">Transactions</p>
                      <p className="font-semibold text-lg">{filteredBlocks[0].transactions}</p>
                    </div>
                    <div>
                      <p className="opacity-80">Gas Used</p>
                      <p className="font-semibold text-lg">{filteredBlocks[0].gasUsed}</p>
                    </div>
                    <div>
                      <p className="opacity-80">Validator</p>
                      <p className="font-semibold text-lg">{formatAddress(filteredBlocks[0].validator)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => copyToClipboard(filteredBlocks[0].hash, 'hash')}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    {copied === 'hash' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <Link
                    href={`/block/${filteredBlocks[0].number}`}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Blocks Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <BlockList 
              blocks={filteredBlocks}
              showAll={true}
            />
          </motion.div>
        </div>
      </div>
    </>
  )
}