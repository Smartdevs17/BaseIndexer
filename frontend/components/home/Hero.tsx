'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Code, Database, Bot } from 'lucide-react'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search functionality
    console.log('Search for:', searchQuery)
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
                Base Hackathon 2025
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
          <div className="mt-10 flex items-center gap-x-6">
            <motion.div 
              className="w-full sm:w-auto"
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
                  className="rounded-full py-3 px-4 pl-12 w-full sm:w-80 bg-gray-100 dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-base-blue-500"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </form>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link
                href="/indexer"
                className="rounded-full bg-base-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-base-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-blue-600"
              >
                Launch Explorer
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
                    <span className="text-sm text-gray-400">BaseIndexer Explorer</span>
                  </div>
                </div>
                <div className="p-6 h-[calc(100%-2.5rem)] overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
                  <div className="text-green-400 mb-4">$ baseindexer --launch</div>
                  <div className="text-blue-400 mb-4">
                    <span className="text-gray-400">✓</span> Connected to Base Mainnet
                  </div>
                  <div className="mb-4">
                    <div className="text-purple-400">» AI Agent initialized</div>
                    <div className="pl-4 text-gray-400">Ready to answer blockchain queries...</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-yellow-400">» Recent transactions:</div>
                    <div className="pl-4 text-gray-400 font-mono text-xs">
                      <div className="mb-1">0x7d21c4ea95a4bd8f0fcbe352c34ed77e91cd77c0ff12348a...</div>
                      <div className="mb-1">0x9a12b3d5f0c893e6a43d9bd36641d6c1b0963abaf1c8e2d7...</div>
                      <div>0xe4f09aa0deec5380ae9436f2978b71a4cb01c46b53455bbc...</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-cyan-400">» Command prompt:</div>
                    <div className="flex items-center pl-4 mt-1">
                      <span className="text-gray-500 mr-2">AI&gt;</span>
                      <div className="relative flex-1">
                        <span className="text-white">Tell me about the latest Base protocol upgrade</span>
                        <span className="animate-pulse ml-1">|</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pl-4 text-gray-300">
                    <div className="text-purple-400 mb-1">» AI Response:</div>
                    <div className="pl-2 text-sm">
                      <p>The latest Base protocol upgrade improved transaction throughput by 35% and reduced gas fees by implementing optimized batch processing. Key changes include:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                        <li>Enhanced data availability layer</li>
                        <li>New smart contract optimization engine</li>
                        <li>Improved validator coordination</li>
                      </ul>
                      <div className="mt-2">Upgrade deployment was completed on April 15, 2025.</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-green-400">$ baseindexer --query "token transfers above 100K USD in last 24h"</div>
                    <div className="mt-2 pl-4 font-mono text-xs">
                      <div className="text-gray-400">Processing query...</div>
                      <div className="text-white mt-1">Found 37 transfers matching criteria</div>
                    </div>
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