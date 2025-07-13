'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Clock, 
  MessageSquare, 
  X,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  useRecentTransactions,
  useRecentBlocks,
  useIndexerControl
} from '@/hooks/useBlockchainData';
import SearchBar from '@/components/indexer/SearchBar';
import TransactionList from '@/components/indexer/TransactionList';
import ChatBox from '@/components/ai/ChatBox';

export default function IndexerPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(15);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');
  const [aiTransactions, setAiTransactions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [endpoint, setEndpoint] = useState<string | null>(null); // Changed initial value to null
  
  // Pagination states
  const [transactionPage, setTransactionPage] = useState(1);
  const [blockPage, setBlockPage] = useState(1);
  const itemsPerPage = 50;

  // Fetch data hooks with automatic refresh every 15 seconds
  const { transactions, loading: txsLoading, refreshTransactions } = useRecentTransactions(20);
  const { blocks, loading: blocksLoading, refreshBlocks } = useRecentBlocks(20);
  const { isRunning, indexerError } = useIndexerControl();

  const allTransactions = useMemo(() => {
    return aiTransactions.map((tx: any) => {
      let timestamp;
      try {
        timestamp = tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString();
      } catch (error) {
        console.warn('Invalid timestamp for transaction:', tx.id, tx.timestamp);
        timestamp = new Date().toISOString(); // fallback to current time
      }
      
      return {
        id: tx.id.toString(),
        hash: tx.id.toString(),
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timestamp,
        tokenAddress: tx.tokenAddress,
        source: 'ai'
      };
    });
  }, [aiTransactions]);

  // Paginated data
const paginatedTransactions = allTransactions; // Let DataTable handle pagination


  // Calculate total pages
  const totalTransactionPages = Math.ceil(allTransactions.length / itemsPerPage);
  const totalBlockPages = Math.ceil(blocks.length / itemsPerPage);

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Refresh data function
  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        refreshTransactions(),
        refreshBlocks()
      ]);
      setLastRefreshTime(formatTime(new Date()));
      setTimeUntilRefresh(15); // Reset countdown after successful refresh
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [refreshTransactions, refreshBlocks]);

  const copyToClipboard = () => {
    if (endpoint) {
      navigator.clipboard.writeText(endpoint).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      });
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    // Initial load
    refreshData();

    // Set up interval for auto-refresh (15 seconds)
    const intervalId = setInterval(refreshData, 15000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeUntilRefresh(prev => (prev > 1 ? prev - 1 : 15));
    }, 1000);
    console.log('aiTransactions:', aiTransactions);
    // Cleanup function
    return () => {
      clearInterval(intervalId);
      clearInterval(countdownInterval);
    };
  }, [refreshData, aiTransactions]);
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
 
  // Pagination handlers
  const nextTransactionPage = () => {
    if (transactionPage < totalTransactionPages) {
      setTransactionPage(prev => prev + 1);
    }
  };

  const prevTransactionPage = () => {
    if (transactionPage > 1) {
      setTransactionPage(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen relative">
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

      <div className="flex">
        {/* Main content */}
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-80' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header with indexer status*/}
            <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    <span className="text-base-blue-600 dark:text-base-blue-400">Base</span> Blockchain Indexer
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Explore transactions and blocks on the Base network
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="mr-2">Indexer Status:</span>
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      isRunning ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span>{isRunning ? 'Running' : 'Stopped'}</span>
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={refreshData}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <RefreshCw className={`h-5 w-5 ${txsLoading || blocksLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      <div>Refreshing in {timeUntilRefresh}s</div>
                      {lastRefreshTime && <div>Last refreshed: {lastRefreshTime}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error displays */}
            {indexerError && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                <AlertTriangle className="inline mr-2" />
                {indexerError}
              </div>
            )}

            {/* Search section */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <div className="max-w-3xl mx-auto">
                  <SearchBar 
                    value="" 
                    onChange={() => {}} 
                    onSearch={() => {}} 
                    isSearching={false} 
                  />
                  <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Search by transaction hash, block number, address, or token
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main content area with only blocks and transactions */}
            <div className="grid grid-cols-1 gap-6">
          
              {/* Recent Transactions */}
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-base-blue-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Transactions</h3>
                  </div>
                </div>
                {txsLoading ? (
                  <div className="p-6 animate-pulse">
                    <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
                  </div>
                ) : (
                  <>
                    {paginatedTransactions.length > 0 && endpoint && (
                      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">API Endpoint:</span>
                          <span className="text-sm font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                            {endpoint}
                          </span>
                          <button
                            onClick={copyToClipboard}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title={copied ? 'Copied!' : 'Copy to clipboard'}
                          >
                            {copied ? (
                              <Check size={16} className="text-green-500" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    <TransactionList transactions={paginatedTransactions} />        
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* AI Chat Button */}
        {!isChatOpen && (
          <button
            onClick={toggleChat}
            className="fixed bottom-6 right-6 bg-base-blue-600 hover:bg-base-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center justify-center z-20"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        )}

        {/* AI Chat Sidebar */}
        <div 
          className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-800 shadow-xl transition-transform duration-300 transform z-30 ${
            isChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              <span className="text-base-blue-600 dark:text-base-blue-400">Base</span> Assistant
            </h3>
            <button 
              onClick={toggleChat}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* ChatBox component */}
          <div className="h-full pt-4 pb-20">
            <ChatBox setAiTransactions={setAiTransactions} setEndpoint={setEndpoint}/>
          </div>
        </div>
      </div>
    </div>
  );
}