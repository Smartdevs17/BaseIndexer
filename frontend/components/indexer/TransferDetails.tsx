// src/components/indexer/TransferDetails.tsx
import React from 'react';
import { ExternalLink, Copy } from 'lucide-react';

interface TransferDetailsProps {
  transfer: {
    id: number;
    from: string;
    to: string;
    value: string;
    tokenAddress: string;
    blockNumber: number;
    timestamp: string;
  };
}

const TransferDetails: React.FC<TransferDetailsProps> = ({ transfer }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Transfer Details</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
          <span className="font-mono">{transfer.id}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">From:</span>
          <div className="flex items-center">
            <span className="font-mono mr-2">{transfer.from}</span>
            <button onClick={() => copyToClipboard(transfer.from)} className="text-gray-400 hover:text-gray-600">
              <Copy size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">To:</span>
          <div className="flex items-center">
            <span className="font-mono mr-2">{transfer.to}</span>
            <button onClick={() => copyToClipboard(transfer.to)} className="text-gray-400 hover:text-gray-600">
              <Copy size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Value:</span>
          <span className="font-mono">{transfer.value}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Token Address:</span>
          <div className="flex items-center">
            <span className="font-mono mr-2">{transfer.tokenAddress}</span>
            <button onClick={() => copyToClipboard(transfer.tokenAddress)} className="text-gray-400 hover:text-gray-600">
              <Copy size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Block Number:</span>
          <span className="font-mono">{transfer.blockNumber}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Timestamp:</span>
          <span>{new Date(transfer.timestamp).toLocaleString()}</span>
        </div>
      </div>
      
      <div className="mt-6 flex space-x-4">
        <a
          href={`https://etherscan.io/tx/${transfer.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <ExternalLink size={16} className="mr-1" />
          View on Etherscan
        </a>
      </div>
    </div>
  );
};

export default TransferDetails;