import React from 'react';
import Link from 'next/link';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import DataTable from './DataTable';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Transaction } from '@/hooks/useBlockchainData';

interface TransactionListProps {
  transactions: Transaction[];
  showPagination?: boolean;
  showAll?: boolean;
}

const formatAddress = (address: string) => {
  if (!address) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const formatValue = (value: string) => {
  if (!value) return '0';
  try {
    const numValue = parseFloat(value);
    return numValue.toFixed(4);
  } catch (error) {
    console.error('Error formatting value:', error);
    return '0';
  }
};

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  showPagination = true,
  showAll = false 
}) => {
  const columnHelper = createColumnHelper<Transaction>();
  
  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('from', {
      header: 'From',
      cell: info => (
        <Link 
          href={`/address/${info.getValue()}`}
          className="text-blue-600 hover:text-blue-800"
        >
          {formatAddress(info.getValue())}
        </Link>
      ),
    }),
    columnHelper.accessor('to', {
      header: 'To',
      cell: info => (
        <Link 
          href={`/address/${info.getValue()}`}
          className="text-blue-600 hover:text-blue-800"
        >
          {formatAddress(info.getValue())}
        </Link>
      ),
    }),
    columnHelper.accessor('value', {
      header: 'Value',
      cell: info => formatValue(info.getValue()),
    }),
    columnHelper.accessor('tokenAddress', {
      header: 'Token',
      // Only show token address if it exists
      cell: info => info.getValue() ? formatAddress(info.getValue() as string) : '-',
    }),
    columnHelper.accessor('blockNumber', {
      header: 'Block',
      cell: info => info.getValue() ? (
        <Link 
          href={`/block/${info.getValue()}`}
          className="text-blue-600 hover:text-blue-800"
        >
          {info.getValue()}
        </Link>
      ) : '-',
    }),
    columnHelper.accessor('timestamp', {
      header: 'Time',
      cell: info => formatDistanceToNow(new Date(info.getValue()), { addSuffix: true }),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            {status?.toLowerCase() === 'failed' && <XCircle className="h-4 w-4 text-red-500 mr-1" />}
            {status?.toLowerCase() === 'pending' && <Clock className="h-4 w-4 text-yellow-500 mr-1" />}
            <span className={`text-xs ${
              status?.toLowerCase() === 'success' ? 'text-green-500' : 
              status?.toLowerCase() === 'failed' ? 'text-red-500' : 'text-green-500'
            }`}>
              {status?.toLowerCase() || 'Success'}
            </span>
          </div>
        );
      },
    }),
  ];
  
  
  const displayedColumns: ColumnDef<Transaction>[] = showAll ? (columns as ColumnDef<Transaction>[]) : ([
    columns[1], 
    columns[2], 
    columns[3], 
    columns[6], 
    columns[7], 
  ] as ColumnDef<Transaction>[]);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
      <DataTable 
        data={transactions}
        columns={displayedColumns}
        pagination={showPagination}
      />
    </div>
  );
};

export default TransactionList;