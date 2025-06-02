// src/app/address/[address]/page.tsx
'use client'

import { useState } from 'react'
import { ArrowLeft, Copy, ExternalLink, Wallet, Clock, CreditCard, Activity, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TransactionList from '@/components/indexer/TransactionList'
import DataTable from '@/components/indexer/DataTable'
import ExportButton from '@/components/indexer/ExportButton'
// import useAddressDetails from '@/hooks/useBlockchainData'
import useAddressDetails from '@/hooks/useAddressDetails'

const tabs = [
  { name: 'Overview', value: 'overview' },
  { name: 'Transactions', value: 'transactions' },
  { name: 'Tokens', value: 'tokens' },
  { name: 'Analytics', value: 'analytics' },
  { name: 'Contract', value: 'contract' },
]

interface Transaction {
  id: string | number;
  hash?: string;
  from: string;
  to: string;
  value: string;
  tokenAddress?: string;
  blockNumber?: number;
  timestamp: string | Date;
  status?: 'success' | 'failed' | 'pending';
  gasUsed?: number;
  gasPrice?: string;
}

interface Token {
  symbol: string
  balance: string
  value: string
}

export default async function AddressPage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = await params;
  const [selectedTab, setSelectedTab] = useState('overview')
  const [timeFrame, setTimeFrame] = useState('24h')
  const [copied, setCopied] = useState(false)
  const { details: addressData, loading, error } = useAddressDetails(resolvedParams.address)

  const copyToClipboard = () => {
    if (!addressData?.address) return
    navigator.clipboard.writeText(addressData.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 min-h-screen flex justify-center items-center">
        <div className="text-base-blue-600 dark:text-base-blue-400">
          <div className="w-12 h-12 border-4 border-current border-solid rounded-full border-r-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error || !addressData) {
    return (
      <div className="bg-white dark:bg-slate-900 min-h-screen flex justify-center items-center">
        <div className="text-red-500">{error || 'Address not found'}</div>
      </div>
    )
  }

  // Format transactions data for the selected time frame
  const filteredTransactions = addressData.transactions?.filter((tx: Transaction) => {
    if (timeFrame === 'all') return true
    const txDate = new Date(tx.timestamp)
    const now = new Date()
    const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (timeFrame === '24h') return diffDays <= 1
    if (timeFrame === '7d') return diffDays <= 7
    if (timeFrame === '30d') return diffDays <= 30
    return true
  })

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">
        <svg
          className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
            fillOpacity=".3"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9089FC" />
              <stop offset={1} stopColor="#FF80B5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/explorer" className="inline-flex items-center text-base-blue-600 dark:text-base-blue-400 hover:text-base-blue-800 dark:hover:text-base-blue-300 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explorer
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Address Details</h1>
        </motion.div>

        {/* Address summary card */}
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Address</div>
                <div className="flex items-center">
                  <span className="font-mono text-lg font-medium text-slate-900 dark:text-white truncate max-w-md">
                    {addressData.address}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="ml-2 text-slate-400 hover:text-base-blue-600 dark:hover:text-base-blue-400 transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <span className="text-green-500 text-sm">Copied!</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={`https://etherscan.io/address/${addressData.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-slate-400 hover:text-base-blue-600 dark:hover:text-base-blue-400 transition-colors"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
                <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Balance</div>
                  <div className="font-medium text-slate-900 dark:text-white">{addressData.balance}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{addressData.usdValue}</div>
                </div>
                
                <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Transactions</div>
                  <div className="font-medium text-slate-900 dark:text-white">{addressData.transactions?.length?.toLocaleString() || '0'}</div>
                </div>
                
                <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Last Active</div>
                  <div className="font-medium text-slate-900 dark:text-white">{addressData.lastActive}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              // Hide contract tab if not a contract
              if (tab.value === 'contract' && !addressData.isContract) return null
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedTab(tab.value)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.value
                      ? 'border-base-blue-600 text-base-blue-600 dark:border-base-blue-400 dark:text-base-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                      <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Value</p>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{addressData.usdValue}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                      <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Transactions</p>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{addressData.transactions?.length?.toLocaleString() || '0'}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                      <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tokens</p>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{addressData.tokens?.length || '0'}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">First Transaction</p>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{addressData.firstTxDate || 'Unknown'}</h3>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Transactions */}
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="p-6">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Recent Transactions</h2>
                  <TransactionList 
                    transactions={addressData.recentTransactions || []} 
                    showPagination={false} 
                  />
                  {addressData.transactions?.length > 0 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setSelectedTab('transactions')}
                        className="text-base-blue-600 dark:text-base-blue-400 hover:text-base-blue-800 dark:hover:text-base-blue-300"
                      >
                        View all transactions
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Token Holdings */}
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="p-6">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Token Holdings</h2>
                  {addressData.tokens?.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                          <thead className="bg-slate-50 dark:bg-slate-800/60">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Token</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {addressData.tokens.map((token: Token, index: number) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{token.symbol}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{token.balance}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{token.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setSelectedTab('tokens')}
                          className="text-base-blue-600 dark:text-base-blue-400 hover:text-base-blue-800 dark:hover:text-base-blue-300"
                        >
                          View all tokens
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No token holdings found
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Contract Information (if contract) */}
              {addressData.isContract && (
                <motion.div
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Contract Information</h2>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-slate-400 mr-2" />
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-2">Name:</span>
                        <span className="text-sm text-slate-900 dark:text-white">{addressData.contractInfo?.name || 'Unknown'}</span>
                        {addressData.contractInfo?.verified && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-slate-400 mr-2" />
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-2">Created:</span>
                        <span className="text-sm text-slate-900 dark:text-white">{addressData.contractInfo?.createdAt || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <Wallet className="w-5 h-5 text-slate-400 mr-2" />
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-2">Creator:</span>
                        <span className="text-sm font-mono text-slate-900 dark:text-white truncate max-w-md">
                          {addressData.contractInfo?.createdBy || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setSelectedTab('contract')}
                        className="text-base-blue-600 dark:text-base-blue-400 hover:text-base-blue-800 dark:hover:text-base-blue-300"
                      >
                        View contract details
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {selectedTab === 'transactions' && (
            <div className="space-y-6">
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4 md:mb-0">Transactions</h2>
                    <div className="flex space-x-2">
                      <div className="inline-flex rounded-md shadow-sm">
                        <button
                          type="button"
                          onClick={() => setTimeFrame('24h')}
                          className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                            timeFrame === '24h'
                              ? 'bg-base-blue-600 text-white dark:bg-base-blue-500'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600'
                          }`}
                        >
                          24h
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeFrame('7d')}
                          className={`px-4 py-2 text-sm font-medium ${
                            timeFrame === '7d'
                              ? 'bg-base-blue-600 text-white dark:bg-base-blue-500'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600'
                          }`}
                        >
                          7d
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeFrame('30d')}
                          className={`px-4 py-2 text-sm font-medium ${
                            timeFrame === '30d'
                              ? 'bg-base-blue-600 text-white dark:bg-base-blue-500'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600'
                          }`}
                        >
                          30d
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeFrame('all')}
                          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                            timeFrame === 'all'
                              ? 'bg-base-blue-600 text-white dark:bg-base-blue-500'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600'
                          }`}
                        >
                          All
                        </button>
                      </div>
                      <ExportButton 
                        data={filteredTransactions || []} 
                        filename={`transactions_${addressData.address.substring(0, 8)}`} 
                      />
                    </div>
                  </div>
                  {filteredTransactions?.length > 0 ? (
                    <TransactionList 
                      transactions={filteredTransactions} 
                      showPagination={true} 
                    />
                  ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      No transactions found for this time period
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {selectedTab === 'tokens' && (
            <div className="space-y-6">
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4 md:mb-0">Token Holdings</h2>
                    <ExportButton 
                      data={addressData.tokens || []} 
                      filename={`tokens_${addressData.address.substring(0, 8)}`} 
                    />
                  </div>
                  {addressData.tokens?.length > 0 ? (
                    <DataTable
                      columns={[
                        { id: 'symbol', header: 'Token', accessorKey: 'symbol' },
                        { id: 'balance', header: 'Balance', accessorKey: 'balance' },
                        { id: 'value', header: 'Value', accessorKey: 'value' },
                      ]}
                      data={addressData.tokens}
                    />
                  ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      No token holdings found
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Transaction Analytics</h2>
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">Transaction volume chart would go here</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="p-6">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Value Analytics</h2>
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">Value over time chart would go here</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {selectedTab === 'contract' && addressData.isContract && (
            <div className="space-y-6">
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Contract Details</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-slate-900 dark:text-white mb-2">Basic Information</h3>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Contract Name</dt>
                            <dd className="mt-1 text-sm text-slate-900 dark:text-white">{addressData.contractInfo?.name || 'Unknown'}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Compiler Version</dt>
                            <dd className="mt-1 text-sm text-slate-900 dark:text-white">{addressData.contractInfo?.compiler || 'Unknown'}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Optimization</dt>
                            <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                              {addressData.contractInfo?.optimization ? 'Enabled' : 'Disabled'}
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Verified</dt>
                            <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                              {addressData.contractInfo?.verified ? 'Yes' : 'No'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-medium text-slate-900 dark:text-white mb-2">Contract Source Code</h3>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <pre className="text-xs font-mono text-slate-900 dark:text-white overflow-x-auto">
                          {addressData.contractInfo?.sourceCode || 'Source code not available'}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-medium text-slate-900 dark:text-white mb-2">ABI</h3>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <pre className="text-xs font-mono text-slate-900 dark:text-white overflow-x-auto">
                          {addressData.contractInfo?.abi ? JSON.stringify(addressData.contractInfo.abi, null, 2) : 'ABI not available'}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}