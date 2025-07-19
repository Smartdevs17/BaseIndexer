// frontend/hooks/useAnalytics.ts
import { useState, useEffect, useCallback } from 'react'

interface NetworkMetrics {
  totalTransactions: number
  totalValue: number
  activeAddresses: number
  avgBlockTime: number
  totalBlocks: number
  tps: number
  totalGasUsed: number
  change24h: {
    transactions: number
    value: number
    addresses: number
    tps: number
  }
}

interface TransactionVolumeData {
  time: string
  transactions: number
  volume: number
  gasUsed: number
  timestamp: string
}

interface TokenDistribution {
  name: string
  symbol: string
  value: number
  volume: number
  color: string
  address: string
  transferCount: number
}

interface GasData {
  date: string
  avgGasPrice: string
  gasUsed: number
  blockCount: number
}

interface TopToken {
  symbol: string
  address: string
  volume: number
  transactions: number
  uniqueAddresses: number
  avgTransferValue: number
  change24h: number
}

interface AnalyticsData {
  networkMetrics: NetworkMetrics
  transactionVolumeData: TransactionVolumeData[]
  tokenDistribution: TokenDistribution[]
  gasData: GasData[]
  topTokens: TopToken[]
  timestamp: string
}

interface UseAnalyticsParams {
  timeRange?: string
  autoRefresh?: boolean
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  setTimeRange: (range: string) => void
  timeRange: string
  
  // Individual data accessors
  networkMetrics: NetworkMetrics | null
  transactionVolumeData: TransactionVolumeData[]
  tokenDistribution: TokenDistribution[]
  gasData: GasData[]
  topTokens: TopToken[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function useAnalytics({ 
  timeRange: initialTimeRange = '24h', 
  autoRefresh = false 
}: UseAnalyticsParams = {}): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState(initialTimeRange)

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/analytics/overview?timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics data')
      }

      setData(result.data)
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      
      // Set fallback empty data on error
      setData({
        networkMetrics: {
          totalTransactions: 0,
          totalValue: 0,
          activeAddresses: 0,
          avgBlockTime: 12,
          totalBlocks: 0,
          tps: 0,
          totalGasUsed: 0,
          change24h: {
            transactions: 0,
            value: 0,
            addresses: 0,
            tps: 0
          }
        },
        transactionVolumeData: [],
        tokenDistribution: [],
        gasData: [],
        topTokens: [],
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  // Fetch individual data endpoints for more granular updates
  const fetchMetrics = useCallback(async (): Promise<NetworkMetrics | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/metrics`)
      const result = await response.json()
      return result.success ? result.data : null
    } catch (err) {
      console.error('Error fetching metrics:', err)
      return null
    }
  }, [])

  const fetchVolumeData = useCallback(async (): Promise<TransactionVolumeData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/volume?timeRange=${timeRange}`)
      const result = await response.json()
      return result.success ? result.data : []
    } catch (err) {
      console.error('Error fetching volume data:', err)
      return []
    }
  }, [timeRange])

  const fetchTokenData = useCallback(async (): Promise<{
    distribution: TokenDistribution[]
    topTokens: TopToken[]
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/tokens`)
      const result = await response.json()
      return result.success ? result.data : { distribution: [], topTokens: [] }
    } catch (err) {
      console.error('Error fetching token data:', err)
      return { distribution: [], topTokens: [] }
    }
  }, [])

  const fetchGasData = useCallback(async (): Promise<GasData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/gas?days=7`)
      const result = await response.json()
      return result.success ? result.data : []
    } catch (err) {
      console.error('Error fetching gas data:', err)
      return []
    }
  }, [])

  // Manual refresh function
  const refetch = useCallback(async () => {
    await fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchAnalyticsData()
    }, 60000) // Refresh every 60 seconds for analytics

    return () => clearInterval(interval)
  }, [autoRefresh, fetchAnalyticsData])

  // Refetch when time range changes
  useEffect(() => {
    if (data) { // Only refetch if we already have data (avoid double initial fetch)
      fetchAnalyticsData()
    }
  }, [timeRange])

  return {
    data,
    loading,
    error,
    refetch,
    setTimeRange,
    timeRange,
    
    // Individual data accessors
    networkMetrics: data?.networkMetrics || null,
    transactionVolumeData: data?.transactionVolumeData || [],
    tokenDistribution: data?.tokenDistribution || [],
    gasData: data?.gasData || [],
    topTokens: data?.topTokens || []
  }
}

// Utility functions for formatting analytics data
export function formatMetricValue(
    value: number,
    type: 'number' | 'currency' | 'percentage' = 'number'
): string {
    if (!isFinite(value)) return '-'

    // Handle extremely large numbers with scientific notation
    if (Math.abs(value) >= 1e12) {
        const exponent = Math.floor(Math.log10(Math.abs(value)))
        const mantissa = value / Math.pow(10, exponent)
        const formatted = mantissa.toFixed(2)
        return type === 'currency'
            ? `$${formatted}e${exponent}`
            : `${formatted}e${exponent}`
    }

    switch (type) {
        case 'currency':
            if (value >= 1e9) {
                return `$${(value / 1e9).toFixed(2)}B`
            } else if (value >= 1e6) {
                return `$${(value / 1e6).toFixed(2)}M`
            } else if (value >= 1e3) {
                return `$${(value / 1e3).toFixed(2)}K`
            }
            return `$${value.toFixed(2)}`
        case 'percentage':
            return `${value.toFixed(1)}%`
        default:
            if (value >= 1e9) {
                return `${(value / 1e9).toFixed(2)}B`
            } else if (value >= 1e6) {
                return `${(value / 1e6).toFixed(2)}M`
            } else if (value >= 1e3) {
                return `${(value / 1e3).toFixed(2)}K`
            }
            return value.toLocaleString()
    }
}

export function formatChange(change: number): { 
  text: string
  positive: boolean 
} {
  const positive = change >= 0
  return {
    text: `${positive ? '+' : ''}${change.toFixed(1)}%`,
    positive
  }
}