// components/indexer/NewDataNotification.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function NewDataNotification({ isVisible, onRefresh, dataType = 'data' }) {
  const [animatedDot, setAnimatedDot] = useState(false);

  // Animate the dot every 2 seconds
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setAnimatedDot(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-base-blue-100 dark:bg-slate-700 border border-base-blue-300 dark:border-slate-600 
                     rounded-md p-2 mb-4 flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="relative flex h-3 w-3 mr-2">
              <motion.span 
                animate={{ 
                  scale: animatedDot ? 1 : 0.7,
                  opacity: animatedDot ? 1 : 0.7
                }}
                transition={{ duration: 1 }}
                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-base-blue-500 dark:bg-base-blue-400 opacity-75"
              />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-base-blue-600 dark:bg-base-blue-500" />
            </span>
            <span className="text-sm text-base-blue-800 dark:text-base-blue-200">
              New {dataType} available
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center text-xs text-base-blue-700 dark:text-base-blue-300 
                       hover:text-base-blue-900 dark:hover:text-base-blue-100 font-medium px-2 py-1 
                       bg-base-blue-50 dark:bg-slate-800 rounded-md"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}