'use client'

import { motion } from 'framer-motion'
import { Brain, Search, Code, Database, Bot, FileDown, PieChart, RefreshCcw, MessageCircle } from 'lucide-react'

const features = [
  {
    name: 'Natural Language Queries',
    description: 'Query blockchain data using plain English. Ask complex questions and get intelligent answers without writing SQL or complex filters.',
    icon: Brain,
  },
  {
    name: 'Real-time Indexing',
    description: 'Access the latest Base blockchain data with minimal latency. Our indexer processes new blocks and transactions within seconds.',
    icon: RefreshCcw,
  },
  {
    name: 'Enhanced Analytics',
    description: 'Visualize blockchain metrics, transaction flows, and network activity with interactive charts and customizable dashboards.',
    icon: PieChart,
  },
  {
    name: 'Developer API',
    description: 'Integrate our indexer into your dApps and tools with our comprehensive GraphQL and REST APIs with detailed documentation.',
    icon: Code,
  },
  {
    name: 'AI Insights',
    description: 'Get automated insights on network trends, anomalies, and key blockchain activities through our intelligent analysis engine.',
    icon: Bot,
  },
  {
    name: 'Export & Integration',
    description: 'Export indexed data to CSV, JSON, or connect directly to data analysis tools for further processing and visualization.',
    icon: FileDown,
  },
]

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="relative flex flex-col gap-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-base-blue-500/10 text-base-blue-600 dark:text-base-blue-400">
        <feature.icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-xl font-semibold leading-8 text-gray-900 dark:text-white">
          {feature.name}
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}

export default function Features() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-base font-semibold leading-7 text-base-blue-600 dark:text-base-blue-400"
          >
            Advanced Blockchain Exploration
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            Everything you need to explore the Base ecosystem
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400"
          >
            Our AI-powered blockchain indexer combines powerful search capabilities with intelligent 
            analysis to help you navigate the Base blockchain more effectively than ever before.
          </motion.p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={feature.name} feature={feature} index={index} />
            ))}
          </div>
        </div>
        
        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-20 flex justify-center"
        >
          <div className="rounded-full bg-base-blue-50 dark:bg-gray-800 p-2">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:gap-6">
              <p className="text-sm font-semibold leading-6 text-base-blue-900 dark:text-base-blue-400 px-3">
                Ready to try our AI-powered blockchain explorer?
              </p>
              <a
                href="/explorer"
                className="inline-flex rounded-full bg-base-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-base-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-blue-600"
              >
                Get started <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}