'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Database, Users, Layers, Zap } from 'lucide-react'

// In a real application, this would come from your API
const DUMMY_STATS = {
  blocksIndexed: 2457890,
  transactionsProcessed: 48765321,
  addressesTracked: 1879043,
  contractsIndexed: 56892,
  dailyQueries: 324872,
}

interface StatItemProps {
  title: string
  value: string
  icon: React.ElementType
  trend?: string
  delay: number
}

const StatItem = ({ title, value, icon: Icon, trend, delay }: StatItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-base-blue-100 dark:bg-base-blue-900/20 p-3 text-base-blue-600 dark:text-base-blue-400">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        {value}
      </div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</div>
      {trend && (
        <div className="mt-2 flex items-center justify-center gap-1 text-green-500 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span>{trend}</span>
        </div>
      )}
    </motion.div>
  )
}

export default function Stats() {
  // Animate counter values
  const [displayStats, setDisplayStats] = useState({
    blocksIndexed: 0,
    transactionsProcessed: 0,
    addressesTracked: 0,
    contractsIndexed: 0,
    dailyQueries: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayStats(prev => ({
        blocksIndexed: Math.min(prev.blocksIndexed + 40000, DUMMY_STATS.blocksIndexed),
        transactionsProcessed: Math.min(prev.transactionsProcessed + 800000, DUMMY_STATS.transactionsProcessed),
        addressesTracked: Math.min(prev.addressesTracked + 30000, DUMMY_STATS.addressesTracked),
        contractsIndexed: Math.min(prev.contractsIndexed + 1000, DUMMY_STATS.contractsIndexed),
        dailyQueries: Math.min(prev.dailyQueries + 5000, DUMMY_STATS.dailyQueries),
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="bg-white dark:bg-slate-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-base font-semibold leading-7 text-base-blue-600 dark:text-base-blue-400"
          >
            Indexer Performance
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            Powerful blockchain data at your fingertips
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400"
          >
            Our high-performance indexer processes enormous volumes of blockchain data,
            making it instantly searchable and accessible through our AI-powered interface.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 xl:grid-cols-5">
          <StatItem
            title="Blocks Indexed"
            value={formatNumber(displayStats.blocksIndexed)}
            icon={Layers}
            trend="+1,200 daily"
            delay={0.3}
          />
          <StatItem
            title="Transactions"
            value={formatNumber(displayStats.transactionsProcessed)}
            icon={Zap}
            trend="+25,000 hourly"
            delay={0.4}
          />
          <StatItem
            title="Addresses Tracked"
            value={formatNumber(displayStats.addressesTracked)}
            icon={Users}
            trend="+3,500 daily"
            delay={0.5}
          />
          <StatItem
            title="Smart Contracts"
            value={formatNumber(displayStats.contractsIndexed)}
            icon={Database}
            trend="+120 daily"
            delay={0.6}
          />
          <StatItem
            title="Daily Queries"
            value={formatNumber(displayStats.dailyQueries)}
            icon={TrendingUp}
            trend="+15% weekly"
            delay={0.7}
          />
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="relative mt-16 sm:mt-24 rounded-2xl bg-gradient-to-r from-base-blue-600 to-indigo-600 p-px shadow-xl"
        >
          <div className="bg-white dark:bg-gray-900 px-8 py-10 sm:px-10 sm:py-12 rounded-2xl">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-lg font-semibold leading-8 tracking-tight text-base-blue-600 dark:text-base-blue-400">
                Trusted by developers
              </h3>
              <p className="mt-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                "This AI-powered indexer has revolutionized how we analyze on-chain data."
              </p>
              <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
                The natural language query interface and deep indexing capabilities have saved our team countless hours of development time. 
                We can now extract meaningful insights from the Base blockchain in minutes instead of days.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              <div className="text-left">
                <div className="text-base font-semibold text-gray-900 dark:text-white">Smartdev</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Lead Developer @ BaseIndexer</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}