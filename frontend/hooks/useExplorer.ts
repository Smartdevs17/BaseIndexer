import { useState, useEffect, useCallback } from 'react'
import { createApiUrl, ENDPOINTS } from '@/lib/config'

interface NetworkStats {
  totalTransfers: number
  uniqueAddresses: number
  uniqueTokens: number
  uniqueBlocks: number
  recentActivity: number
}

interface NetworkOverview {
  latestBlock: number
  oldestBlock: number
  blockRange: number
  indexingStartTime: string
  lastIndexedTime: string
}

interface TopToken {
  address: string
  transferCount: number
  lastActivity: string
}

interface TrendingToken {
  address: string
  recentTransfers: number
}

interface RecentActivity {
  id: number
  from: string
  to: string
  value: string
  tokenAddress: string
  blockNumber: number
  timestamp: string
  transactionHash: string
  type: string
}

interface ExplorerData {
  network: NetworkStats
  overview: NetworkOverview
  topTokens: TopToken[]
  trendingTokens: TrendingToken[]
  recentActivity: RecentActivity[]
}

interface UseExplorerReturn {
  data: ExplorerData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  networkStats: NetworkStats | null
  recentActivity: RecentActivity[]
  topTokens: TopToken[]
  trendingTokens: TrendingToken[]
}

export function useExplorer(): UseExplorerReturn {
  const [data, setData] = useState<ExplorerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExplorerData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the new configuration
      const apiUrl = createApiUrl(ENDPOINTS.EXPLORER_STATS)
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch explorer data')
      }

      setData(result.data)
    } catch (err) {
      console.error('Error fetching explorer data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      
      // Set fallback empty data on error to prevent blank page
      setData({
        network: {
          totalTransfers: 0,
          uniqueAddresses: 0,
          uniqueTokens: 0,
          uniqueBlocks: 0,
          recentActivity: 0
        },
        overview: {
          latestBlock: 0,
          oldestBlock: 0,
          blockRange: 0,
          indexingStartTime: new Date().toISOString(),
          lastIndexedTime: new Date().toISOString()
        },
        topTokens: [],
        trendingTokens: [],
        recentActivity: []
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExplorerData()
  }, [fetchExplorerData])

  return {
    data,
    loading,
    error,
    refetch: fetchExplorerData,
    networkStats: data?.network || null,
    recentActivity: data?.recentActivity || [],
    topTokens: data?.topTokens || [],
    trendingTokens: data?.trendingTokens || []
  }
}

// Helper function to format token address for display
export function formatTokenAddress(address: string): string {
  if (!address) return 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Helper function to format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Helper function to format token name (you can expand this with a token mapping)
export function getTokenSymbol(address: string): string {
  const tokenMap: { [key: string]: string } = {
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
    // Add more token mappings as needed
  }
  
  return tokenMap[address.toLowerCase()] || formatTokenAddress(address)
}