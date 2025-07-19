import { useState, useEffect, useCallback } from 'react'

interface BlockFilters {
  blockRange: 'all' | '24h' | '7d' | '30d'
  minTransactions: string
  maxTransactions: string
  validator: string
  minGasUsed: string
  maxGasUsed: string
}

interface Block {
  number: number
  hash: string
  timestamp: string
  transactions: number
  validator: string
  gasUsed: string
  gasLimit: string
  baseFeePerGas: number
  reward: string
  size: number
  totalValue: string
  uniqueTokens: number
  topToken: string
}

interface BlockStats {
  totalBlocks: number
  latestBlockNumber: number
  latestBlockTimestamp: string
  avgTransactionsPerBlock: number
  avgBlockTime: number
  totalTransactions: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UseBlocksParams {
  limit?: number
  autoRefresh?: boolean
}

interface UseBlocksReturn {
  blocks: Block[]
  filteredBlocks: Block[]
  loading: boolean
  error: string | null
  stats: BlockStats | null
  refetch: () => Promise<void>
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: BlockFilters
  setFilters: (filters: BlockFilters) => void
  clearFilters: () => void
  pagination: Pagination | null
  currentPage: number
  setCurrentPage: (page: number) => void
  searchBlocks: (query: string) => Promise<Block[]>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function useBlocks({ 
  limit = 50, 
  autoRefresh = false 
}: UseBlocksParams = {}): UseBlocksReturn {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<BlockStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  
  const [filters, setFilters] = useState<BlockFilters>({
    blockRange: 'all',
    minTransactions: '',
    maxTransactions: '',
    validator: '',
    minGasUsed: '',
    maxGasUsed: ''
  })

  const fetchBlocks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString()
      })

      // Add filters
      if (filters.blockRange !== 'all') {
        params.append('dateRange', filters.blockRange)
      }
      if (filters.minTransactions) {
        params.append('minTransactions', filters.minTransactions)
      }
      if (filters.maxTransactions) {
        params.append('maxTransactions', filters.maxTransactions)
      }

      const response = await fetch(`${API_BASE_URL}/api/blocks?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch blocks')
      }

      setBlocks(result.data)
      setPagination(result.pagination)
    } catch (err) {
      console.error('Error fetching blocks:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setBlocks([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, limit, filters])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blocks/stats`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      }
    } catch (err) {
      console.error('Error fetching block stats:', err)
      // Don't set error state for stats failure, just continue without stats
    }
  }, [])

  const searchBlocks = useCallback(async (query: string): Promise<Block[]> => {
    try {
      if (!query.trim()) return []

      const response = await fetch(`${API_BASE_URL}/api/blocks/search?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Search failed')
      }

      return result.data
    } catch (err) {
      console.error('Error searching blocks:', err)
      return []
    }
  }, [])

  // Filter blocks based on current filters and search query
  const filteredBlocks = blocks.filter(block => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        block.number.toString().includes(query) ||
        block.hash.toLowerCase().includes(query) ||
        block.validator.toLowerCase().includes(query)
      
      if (!matchesSearch) return false
    }

    // Validator filter
    if (filters.validator && !block.validator.toLowerCase().includes(filters.validator.toLowerCase())) {
      return false
    }

    // Gas used filter (convert from string like "5.2M" to number for comparison)
    if (filters.minGasUsed || filters.maxGasUsed) {
      const gasUsedValue = parseFloat(block.gasUsed.replace('M', ''))
      const minGas = filters.minGasUsed ? parseFloat(filters.minGasUsed) : 0
      const maxGas = filters.maxGasUsed ? parseFloat(filters.maxGasUsed) : Infinity
      
      if (isNaN(gasUsedValue) || gasUsedValue < minGas || gasUsedValue > maxGas) {
        return false
      }
    }

    return true
  })

  const clearFilters = useCallback(() => {
    setFilters({
      blockRange: 'all',
      minTransactions: '',
      maxTransactions: '',
      validator: '',
      minGasUsed: '',
      maxGasUsed: ''
    })
    setSearchQuery('')
    setCurrentPage(1)
  }, [])

  const refetch = useCallback(async () => {
    await Promise.all([fetchBlocks(), fetchStats()])
  }, [fetchBlocks, fetchStats])

  // Initial data fetch
  useEffect(() => {
    fetchBlocks()
  }, [fetchBlocks])

  // Fetch stats on mount
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refetch()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, refetch])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchQuery])

  return {
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
  }
}