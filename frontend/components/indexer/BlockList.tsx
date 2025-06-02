// src/components/indexer/BlockList.tsx
import React from 'react';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import DataTable from './DataTable';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export interface Block {
  number: number;
  hash: string;
  timestamp: string;
  transactions: number;
  validator: string;
  gasUsed: string;
}

interface BlockListProps {
  blocks: Block[];
  showAll?: boolean;
}

const formatAddress = (address: string) => {
  if (!address) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const BlockList: React.FC<BlockListProps> = ({ blocks, showAll = false }) => {
  const columnHelper = createColumnHelper<Block>();

  const columns: Array<ColumnDef<Block, any>> = [
    columnHelper.accessor('number', {
      header: 'Block',
      cell: info => (
        <Link 
          href={`/block/${info.getValue()}`} 
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('timestamp', {
      header: 'Age',
      cell: info => formatDistanceToNow(new Date(info.getValue()), { addSuffix: true }),
    }),
    columnHelper.accessor('transactions', {
      header: 'Txs',
      cell: info => info.getValue().toLocaleString(),
    }),
    columnHelper.accessor('validator', {
      header: 'Validator',
      cell: info => formatAddress(info.getValue()),
    }),
    columnHelper.accessor('gasUsed', {
      header: 'Gas Used',
      cell: info => info.getValue(),
    }),
  ];

  // If not showing all columns, filter to just the essential ones
  const displayedColumns = showAll ? columns : [
    columns[0], // Block
    columns[1], // Age
    columns[2], // Txs
    columns[4], // Gas Used
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
      <DataTable 
        data={blocks} 
        columns={displayedColumns} 
      />
    </div>
  );
};

export default BlockList;