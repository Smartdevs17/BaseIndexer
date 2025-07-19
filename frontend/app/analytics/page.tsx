'use client'

import { useState, useCallback } from 'react'
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
  Globe,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell 
} from 'recharts'
import Navbar from '@/components/layout/Navbar'
import ExportButton from '@/components/indexer/ExportButton'
import { useAnalytics, formatMetricValue, formatChange } from '@/hooks/useAnalytics'

// Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  change, 
  positive, 
  icon: Icon, 
  loading = false 
}: {
  title: string
  value: string | number
  change: number
  positive: boolean
  icon: any
  loading?: boolean
}) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {loading ? '...' : value}
        </p>
        <div className="flex items-center mt-2">
          {positive ? (
            <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
          )}
          <span className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {loading ? '...' : `${positive ? '+' : ''}${change.toFixed(1)}%`}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">24h</span>
        </div>
      </div>
      <Icon className="h-8 w-8 text-base-blue-600" />
    </div>
  </div>
)

export default function AnalyticsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Use the real analytics hook
  const {
    data,
    loading,
    error,
    refetch,
    setTimeRange,
    timeRange,
    networkMetrics,
    transactionVolumeData,
    tokenDistribution,
    gasData,
    topTokens
  } = useAnalytics({ timeRange: '24h', autoRefresh })

  const refreshData = useCallback(async () => {
    await refetch()
  }, [refetch])

  // Prepare export data
  const exportData = {
    metrics: networkMetrics,
    volumeData: transactionVolumeData,
    tokenDistribution,
    gasData,
    topTokens,
    exportTimestamp: new Date().toISOString()
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
                  Analytics Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Real-time insights and metrics from your ERC-20 transfer indexer
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
                    <span className="text-sm">Live Analytics</span>
                  </div>
                )}
                
                {/* Time Range Selector */}
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>

                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-base-blue-600 text-white rounded-lg hover:bg-base-blue-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                <ExportButton
                  data={[exportData]}
                  filename="blockchain-analytics"
                />
              </div>
            </div>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <MetricCard
              title="Total Transactions"
              value={networkMetrics ? formatMetricValue(networkMetrics.totalTransactions) : '0'}
              change={networkMetrics?.change24h.transactions || 0}
              positive={(networkMetrics?.change24h.transactions || 0) >= 0}
              icon={Activity}
              loading={loading}
            />
            
            <MetricCard
              title="Total Value"
              value={networkMetrics ? formatMetricValue(networkMetrics.totalValue, 'currency') : '$0'}
              change={networkMetrics?.change24h.value || 0}
              positive={(networkMetrics?.change24h.value || 0) >= 0}
              icon={DollarSign}
              loading={loading}
            />
            
            <MetricCard
              title="Active Addresses"
              value={networkMetrics ? formatMetricValue(networkMetrics.activeAddresses) : '0'}
              change={networkMetrics?.change24h.addresses || 0}
              positive={(networkMetrics?.change24h.addresses || 0) >= 0}
              icon={Users}
              loading={loading}
            />
            
            <MetricCard
              title="TPS"
              value={networkMetrics ? networkMetrics.tps.toFixed(2) : '0.00'}
              change={networkMetrics?.change24h.tps || 0}
              positive={(networkMetrics?.change24h.tps || 0) >= 0}
              icon={Zap}
              loading={loading}
            />
          </motion.div>

          {/* Additional Metrics Row */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Blocks</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : networkMetrics ? formatMetricValue(networkMetrics.totalBlocks) : '0'}
                  </p>
                </div>
                <Database className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Block Time</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : networkMetrics ? `${networkMetrics.avgBlockTime.toFixed(1)}s` : '0s'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Gas Used</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : networkMetrics ? formatMetricValue(networkMetrics.totalGasUsed) : '0'}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-green-600" />
              </div>
            </div>
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
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={transactionVolumeData}>
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
                      name="Volume"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              )}
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
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={tokenDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tokenDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
              )}
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
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-blue-600"></div>
              </div>
            ) : (
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
            )}
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
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Unique Addresses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Avg Transfer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      24h Change
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    topTokens.map((token, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-3">
                              {token.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {token.symbol}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                                {token.address.slice(0, 10)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {formatMetricValue(token.volume, 'currency')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {formatMetricValue(token.transactions)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {formatMetricValue(token.uniqueAddresses)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {formatMetricValue(token.avgTransferValue, 'currency')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            {token.change24h >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                            )}
                            <span className={token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}