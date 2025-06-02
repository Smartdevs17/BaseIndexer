// src/components/indexer/AddressList.tsx
import React from 'react';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import DataTable from './DataTable';
import Link from 'next/link';

export interface Address {
  address: string;
  balance: string;
  transactions: number;
  lastActive: string;
}

interface AddressListProps {
  addresses: Address[];
  showAll?: boolean;
}

const formatAddress = (address: string) => {
  if (!address) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const AddressList: React.FC<AddressListProps> = ({ addresses, showAll = false }) => {
  const columnHelper = createColumnHelper<Address>();

  const columns: Array<ColumnDef<Address, any>> = [
    columnHelper.accessor('address', {
      header: 'Address',
      cell: info => (
        <Link 
          href={`/address/${info.getValue()}`} 
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {formatAddress(info.getValue())}
        </Link>
      ),
    }),
    columnHelper.accessor('balance', {
      header: 'Balance',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('transactions', {
      header: 'Txs',
      cell: info => info.getValue().toLocaleString(),
    }),
    columnHelper.accessor('lastActive', {
      header: 'Last Active',
      cell: info => info.getValue(),
    }),
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
      <DataTable 
        data={addresses} 
        columns={columns} 
      />
    </div>
  );
};

export default AddressList;