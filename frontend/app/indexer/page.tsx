'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  MessageSquare, 
  X,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Search as SearchIcon,
  ExternalLink
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
import Navbar from '@/components/layout/Navbar';

export default function IndexerPage() {
  const router = useRouter();
  
  // UI state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(15);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [endpoint, setEndpoint] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // AI and data state
  const [aiTransactions, setAiTransactions] = useState<any[]>([]);
  
  // Pagination states
  const [transactionPage, setTransactionPage] = useState(1);
  const [blockPage, setBlockPage] = useState(1);
  const itemsPerPage = 50;

  // Fetch data hooks with automatic refresh every 15 seconds
  const { transactions, loading: txsLoading, refreshTransactions } = useRecentTransactions(20);
  const { blocks, loading: blocksLoading, refreshBlocks } = useRecentBlocks(20);
  const { isRunning, indexerError } = useIndexerControl();

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission - redirect to explorer page
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Redirect to explorer with search query (consistent with Hero and Navbar)
      router.push(`/explorer?search=${encodeURIComponent(query.trim())}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      // Reset searching state after a brief delay
      setTimeout(() => {
        setIsSearching(false);
      }, 500);
    }
  }, [router]);

  // Process AI transactions for display
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

  // Paginated data - let DataTable handle pagination
  const paginatedTransactions = allTransactions;

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

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      clearInterval(countdownInterval);
    };
  }, [refreshData]);
  
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
    <>
    <Navbar />
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    <span className="text-base-blue-600 dark:text-base-blue-400">Base</span> Blockchain Indexer
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Explore transactions and blocks on the Base network
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Indexer Status */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`}></span>
                      <span className={`text-sm font-medium ${
                        isRunning ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {isRunning ? 'Live' : 'Stopped'}
                      </span>
                    </div>
                  </div>

                  {/* Refresh Controls */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={refreshData}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      title="Refresh data"
                    >
                      <RefreshCw className={`h-5 w-5 ${txsLoading || blocksLoading ? 'animate-spin' : ''}`} />
                    </button>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <div>Next refresh: {timeUntilRefresh}s</div>
                      {lastRefreshTime && <div className="text-green-600 dark:text-green-400">Last: {lastRefreshTime}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error displays */}
            {indexerError && (
              <motion.div 
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-400">{indexerError}</span>
                </div>
              </motion.div>
            )}

            {/* Enhanced Search section */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <SearchIcon className="h-5 w-5 text-base-blue-600 dark:text-base-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Blockchain Data</h3>
                  </div>
                  
                  <SearchBar 
                    value={searchQuery} 
                    onChange={handleSearchChange} 
                    onSearch={handleSearch} 
                    isSearching={isSearching}
                    placeholder="Search by transaction hash, block number, address, or token symbol..."
                  />
                  
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Transaction Hash
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Wallet Address
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Block Number
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Token Symbol
                    </span>
                  </div>

                  {/* Quick Search Examples */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Try these examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'USDT transfers',
                        '0x1234...abcd',
                        'Block 18500000',
                        'USDC volume today'
                      ].map((example) => (
                        <button
                          key={example}
                          onClick={() => handleSearch(example)}
                          className="px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-base-blue-100 dark:hover:bg-base-blue-900/20 hover:text-base-blue-600 dark:hover:text-base-blue-400 transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main content area with transactions */}
            <div className="grid grid-cols-1 gap-6">
              {/* Recent Transactions */}
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-base-blue-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Recent Transactions
                      {paginatedTransactions.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({paginatedTransactions.length} found)
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open('/explorer', '_blank')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-base-blue-600 dark:text-base-blue-400 hover:text-base-blue-700 dark:hover:text-base-blue-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View in Explorer
                    </button>
                  </div>
                </div>

                {txsLoading ? (
                  <div className="p-6">
                    <div className="animate-pulse space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="w-16 h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                          <div className="flex-1 h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                          <div className="w-24 h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* API Endpoint display */}
                    {paginatedTransactions.length > 0 && endpoint && (
                      <div className="px-6 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">API:</span>
                            <span className="text-sm font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded border text-gray-800 dark:text-gray-200 truncate">
                              {endpoint}
                            </span>
                          </div>
                          <button
                            onClick={copyToClipboard}
                            className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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

                    {/* Transaction List */}
                    {paginatedTransactions.length > 0 ? (
                      <TransactionList transactions={paginatedTransactions} />
                    ) : (
                      <div className="p-12 text-center">
                        <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Try using the AI assistant to query specific blockchain data
                        </p>
                        <button
                          onClick={toggleChat}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-base-blue-600 text-white rounded-lg hover:bg-base-blue-700 transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Open AI Assistant
                        </button>
                      </div>
                    )}        
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* AI Chat Button */}
        {!isChatOpen && (
          <motion.button
            onClick={toggleChat}
            className="fixed bottom-6 right-6 bg-base-blue-600 hover:bg-base-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center justify-center z-20 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Open AI Assistant
            </span>
          </motion.button>
        )}

        {/* AI Chat Sidebar */}
        <div 
          className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-800 shadow-xl transition-transform duration-300 transform z-30 border-l border-gray-200 dark:border-slate-700 ${
            isChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              <span className="text-base-blue-600 dark:text-base-blue-400">Base</span> AI Assistant
            </h3>
            <button 
              onClick={toggleChat}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
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
    </>
  );
}