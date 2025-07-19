'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Code, Database, Bot } from 'lucide-react'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Redirect to explorer with search query
      router.push(`/explorer?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="relative isolate overflow-hidden bg-white dark:bg-slate-900">
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

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <motion.div 
              className="inline-flex space-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="rounded-full bg-base-blue-500/10 px-3 py-1 text-sm font-semibold leading-6 text-base-blue-600 dark:text-base-blue-400 ring-1 ring-inset ring-base-blue-500/20">
                ✨ AI-Powered Indexer
              </span>
              <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600 dark:text-gray-400">
                <span>Built for Base</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </motion.div>
          </div>
          <motion.h1 
            className="mt-10 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-base-blue-600 dark:text-base-blue-400">AI-Powered</span> Blockchain Indexer
          </motion.h1>
          <motion.p 
            className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Explore the Base blockchain with our advanced indexer enhanced with AI capabilities.
            Query blockchain data using natural language, visualize network activity, and unlock
            deeper insights with intelligent analysis.
          </motion.p>
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-y-4 gap-x-6">
            <motion.div 
              className="w-full sm:flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by tx hash, address, or block..."
                  className="rounded-full py-3 px-4 pl-12 w-full bg-gray-100 dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-base-blue-500 focus:outline-none text-gray-900 dark:text-white"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </form>
            </motion.div>
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link
                href="/explorer"
                className="rounded-full bg-base-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-base-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-blue-600 transition-colors"
              >
                Launch Explorer
              </Link>
              <Link
                href="/indexer"
                className="rounded-full bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Try AI Chat
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <motion.div
              className="relative w-[40rem] h-[30rem] rounded-xl bg-gray-900 shadow-xl dark:ring-1 dark:ring-white/10 sm:w-[45rem]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              {/* Terminal-like UI */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="flex items-center h-10 bg-gray-800 px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <span className="text-sm text-gray-400">BaseIndexer Terminal</span>
                  </div>
                </div>
                <div className="p-6 h-[calc(100%-2.5rem)] overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
                  <div className="text-green-400 mb-4">$ baseindexer --status</div>
                  <div className="text-blue-400 mb-4">
                    <span className="text-gray-400">✓</span> Connected to Base Mainnet
                  </div>
                  <div className="mb-4">
                    <div className="text-purple-400 mb-2">
                      <span className="text-gray-400">→</span> Indexed Transactions: <span className="text-white">1,500+</span>
                    </div>
                    <div className="text-purple-400 mb-2">
                      <span className="text-gray-400">→</span> Active Tokens: <span className="text-white">USDT, USDC, WETH, DAI</span>
                    </div>
                    <div className="text-purple-400 mb-2">
                      <span className="text-gray-400">→</span> AI Assistant: <span className="text-green-400">Online</span>
                    </div>
                  </div>
                  <div className="text-yellow-400 mb-2">
                    <span className="text-gray-400">$</span> Query: "Show me USDT transfers"
                  </div>
                  <div className="text-green-400 mb-4">
                    <span className="text-gray-400">✓</span> Found 847 USDT transfers
                  </div>
                  <div className="text-cyan-400 text-sm">
                    <span className="text-gray-400">◐</span> Indexing new blocks...
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}