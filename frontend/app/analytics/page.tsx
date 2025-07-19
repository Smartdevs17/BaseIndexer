'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Users, 
  Zap,
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Database,
  Globe
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import Navbar from '@/components/layout/Navbar'
import ExportButton from '@/components/indexer/ExportButton'

// Mock data for charts
const generateTransactionVolumeData = () => {
  const data = []
  for (let i = 23; i >= 0; i--) {
    const date = new Date()
    date.setHours(date.getHours() - i)
    data.push({
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      transactions: Math.floor(Math.random() * 1000) + 500,
      volume: Math.floor(Math.random() * 5000000) + 1000000,
      gasUsed: Math.floor(Math.random() * 10000000) + 5000000
    })
  }
  return data
}

const generateTokenData = () => [
  { name: 'USDT', value: 35, volume: 2400000, color: '#22c55e' },
  { name: 'USDC', value: 28, volume: 1800000, color: '#3b82f6' },
  { name: 'WETH', value: 20, volume: 1200000, color: '#8b5cf6' },
  { name: 'DAI', value: 10, volume: 600000, color: '#f59e0b' },
  { name: 'Others', value: 7, volume: 400000, color: '#6b7280' }
]

const generateGasData = () => {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      avgGasPrice: (Math.random() * 0.00005 + 0.00001).toFixed(8),
      gasUsed: Math.floor(Math.random() * 100000000) + 50000000
    })
  }
  return data
}

const networkMetrics = {
  totalTransactions: 2847293,
  totalValue: 12400000000,
  activeAddresses: 45821,
  networkHashRate: 1240000000,
  avgBlockTime: 2.1,
  totalBlocks: 18294,
  tps: 234.5,
  totalGasUsed: 847293847293
}

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280']

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('24h')
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // Mock data
  const [transactionData] = useState(generateTransactionVolumeData())
  const [tokenData] = useState(generateTokenData())
  const [gasData] = useState(generateGasData())

  // Real-time metrics with percentage changes
  const [metrics, setMetrics] = useState({
    transactions: { value: networkMetrics.totalTransactions, change: 2.4, positive: true },
    volume: { value: networkMetrics.totalValue, change: 1.8, positive: true },
    addresses: { value: networkMetrics.activeAddresses, change: 5.2, positive: true },
    tps: { value: networkMetrics.tps, change: -0.8, positive: false },
    gasUsed: { value: networkMetrics.totalGasUsed, change: 3.1, positive: true },
    avgBlockTime: { value: networkMetrics.avgBlockTime, change: -2.3, positive: true }
  })

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    setLastRefresh(new Date())
    
    // Simulate data refresh
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        transactions: { 
          ...prev.transactions, 
          value: prev.transactions.value + Math.floor(Math.random() * 100),
          change: (Math.random() - 0.5) * 10,
          positive: Math.random() > 0.5
        },
        tps: {
          ...prev.tps,
          value: Math.random() * 300 + 100,
          change: (Math.random() - 0.5) * 10,
          positive: Math.random() > 0.5
        }
      }))
      setIsLoading(false)
    }, 1000)
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshData])

  const formatValue = (value: number, type: 'currency' | 'number' | 'percentage' = 'number') => {
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value)
    }
    if (type === 'percentage') {
      return `${value.toFixed(1)}%`
    }
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  type MetricCardProps = {
    title: string
    value: number
    change: number
    positive: boolean
    icon: React.ComponentType<{ className?: string }>
    type?: 'number' | 'currency' | 'percentage'
  }

  const MetricCard = ({ title, value, change, positive, icon: Icon, type = 'number' }: MetricCardProps) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 mr-2" />
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h3>
        </div>
        <div className={`flex items-center text-sm ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {formatValue(value, type)}
      </p>
    </div>
  )

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
                  Analytics Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Real-time insights and metrics for the Base blockchain network
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600"
                  />
                  <label htmlFor="autoRefresh" className="text-sm text-slate-600 dark:text-slate-400">
                    Auto-refresh
                  </label>
                </div>
                
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                </select>
                
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-base-blue-600 text-white rounded-lg hover:bg-base-blue-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                <ExportButton 
                  data={[...transactionData, ...tokenData, ...gasData]}
                  filename="analytics"
                />
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <MetricCard
              title="Total Transactions"
              value={metrics.transactions.value}
              change={metrics.transactions.change}
              positive={metrics.transactions.positive}
              icon={Activity}
            />
            <MetricCard
              title="Total Volume"
              value={metrics.volume.value}
              change={metrics.volume.change}
              positive={metrics.volume.positive}
              icon={DollarSign}
              type="currency"
            />
            <MetricCard
              title="Active Addresses"
              value={metrics.addresses.value}
              change={metrics.addresses.change}
              positive={metrics.addresses.positive}
              icon={Users}
            />
            <MetricCard
              title="TPS"
              value={metrics.tps.value}
              change={metrics.tps.change}
              positive={metrics.tps.positive}
              icon={Zap}
            />
            <MetricCard
              title="Gas Used"
              value={metrics.gasUsed.value}
              change={metrics.gasUsed.change}
              positive={metrics.gasUsed.positive}
              icon={Database}
            />
            <MetricCard
              title="Avg Block Time"
              value={metrics.avgBlockTime.value}
              change={metrics.avgBlockTime.change}
              positive={metrics.avgBlockTime.positive}
              icon={Clock}
            />
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Transaction Volume Chart */}
            <motion.div
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Transaction Volume</h3>
                <LineChart className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Transactions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Volume ($)"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Token Distribution */}
            <motion.div
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Token Distribution</h3>
                <PieChart className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={tokenData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tokenData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Gas Usage Chart */}
          <motion.div
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Gas Usage Trends</h3>
              <BarChart3 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gasData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="gasUsed" fill="#8b5cf6" name="Gas Used" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Tokens Table */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Tokens by Volume</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Share
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                  {tokenData.map((token, index) => (
                    <tr key={token.name} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3" 
                            style={{ backgroundColor: token.color }}
                          ></div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {token.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        ${token.volume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {token.value}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {Math.random() > 0.5 ? (
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          <span className={`text-sm ${Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'}`}>
                            {(Math.random() * 10).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}