import { useState, useEffect, useCallback } from 'react'
import { getTokenSymbol } from './useExplorer'

interface TransactionFilters {
  dateRange: 'all' | '24h' | '7d' | '30d' | 'custom'
  minValue: string
  maxValue: string
  status: 'all' | 'success' | 'failed' | 'pending'
  tokenAddress: string
  fromAddress: string
  toAddress: string
}

interface Transaction {
  id: number
  hash: string
  from: string
  to: string
  value: string
  timestamp: string
  status: 'success' | 'failed' | 'pending'
  blockNumber: number
  gasUsed: number
  gasPrice: string
  tokenAddress: string
}

interface TransactionStats {
  totalTransactions: number
  totalValue: string
  successRate: string
  avgGasUsed: string
}

interface UseTransactionsParams {
  limit?: number
  autoRefresh?: boolean
}

interface UseTransactionsReturn {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  loading: boolean
  error: string | null
  stats: TransactionStats
  refetch: () => Promise<void>
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: TransactionFilters
  setFilters: (filters: TransactionFilters) => void
  clearFilters: () => void
  totalCount: number
  currentPage: number
  setCurrentPage: (page: number) => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function useTransactions({ 
  limit = 100, 
  autoRefresh = false 
}: UseTransactionsParams = {}): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: 'all',
    minValue: '',
    maxValue: '',
    status: 'all',
    tokenAddress: '',
    fromAddress: '',
    toAddress: ''
  })

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch recent activity from the explorer endpoint
      const response = await fetch(`${API_BASE_URL}/api/explorer/activity?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transactions')
      }

      // Transform the activity data to match Transaction interface
      const transformedTransactions: Transaction[] = result.data.map((activity: any) => ({
        id: activity.id,
        hash: activity.transactionHash || `tx_${activity.id}`,
        from: activity.from,
        to: activity.to,
        value: `${activity.value} ${getTokenSymbol(activity.tokenAddress)}`,
        timestamp: activity.timestamp,
        status: 'success' as const, // All indexed transfers are successful
        blockNumber: activity.blockNumber,
        gasUsed: Math.floor(Math.random() * 50000) + 21000, // Mock gas data
        gasPrice: '0.00000001 ETH', // Mock gas price
        tokenAddress: activity.tokenAddress
      }))

      setTransactions(transformedTransactions)
      setTotalCount(transformedTransactions.length)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  // Filter transactions based on current filters and search query
  const filteredTransactions = transactions.filter(tx => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        tx.hash.toLowerCase().includes(query) ||
        tx.from.toLowerCase().includes(query) ||
        tx.to.toLowerCase().includes(query) ||
        tx.value.toLowerCase().includes(query) ||
        tx.tokenAddress.toLowerCase().includes(query)
      
      if (!matchesSearch) return false
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
      
      if (new Date(tx.timestamp) < cutoff) return false
    }

    // Status filter
    if (filters.status !== 'all' && tx.status !== filters.status) {
      return false
    }

    // Address filters
    if (filters.fromAddress && !tx.from.toLowerCase().includes(filters.fromAddress.toLowerCase())) {
      return false
    }
    
    if (filters.toAddress && !tx.to.toLowerCase().includes(filters.toAddress.toLowerCase())) {
      return false
    }

    // Token address filter
    if (filters.tokenAddress && !tx.tokenAddress.toLowerCase().includes(filters.tokenAddress.toLowerCase())) {
      return false
    }

    // Value range filters
    if (filters.minValue || filters.maxValue) {
      const value = parseFloat(tx.value.split(' ')[0])
      const min = filters.minValue ? parseFloat(filters.minValue) : 0
      const max = filters.maxValue ? parseFloat(filters.maxValue) : Infinity
      
      if (isNaN(value) || value < min || value > max) {
        return false
      }
    }

    return true
  })

  // Calculate statistics
  const stats: TransactionStats = {
    totalTransactions: filteredTransactions.length,
    totalValue: filteredTransactions.reduce((sum, tx) => {
      const value = parseFloat(tx.value.split(' ')[0])
      return sum + (isNaN(value) ? 0 : value)
    }, 0).toLocaleString(undefined, { maximumFractionDigits: 2 }),
    successRate: filteredTransactions.length > 0 
      ? ((filteredTransactions.filter(tx => tx.status === 'success').length / filteredTransactions.length) * 100).toFixed(1)
      : '0',
    avgGasUsed: filteredTransactions.length > 0
      ? Math.round(filteredTransactions.reduce((sum, tx) => sum + tx.gasUsed, 0) / filteredTransactions.length).toLocaleString()
      : '0'
  }

  const clearFilters = useCallback(() => {
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
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchTransactions()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, fetchTransactions])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchQuery])

  return {
    transactions,
    filteredTransactions,
    loading,
    error,
    stats,
    refetch: fetchTransactions,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    clearFilters,
    totalCount,
    currentPage,
    setCurrentPage
  }
}