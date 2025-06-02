import { useEffect, useState } from 'react'

// interface Transaction {
//   timestamp: string
//   [key: string]: any
// }

interface Transaction {
    id: string | number;
    hash?: string;
    from: string;
    to: string;
    value: string;
    tokenAddress?: string;
    blockNumber?: number;
    timestamp: string | Date;
    status?: 'success' | 'failed' | 'pending';
    gasUsed?: number;
    gasPrice?: string;
  }

interface Token {
  symbol: string
  balance: string
  value: string
}

interface ContractInfo {
  name?: string
  verified?: boolean
  createdAt?: string
  createdBy?: string
  compiler?: string
  optimization?: boolean
  sourceCode?: string
  abi?: any
}

interface AddressDetails {
  address: string
  balance: string
  usdValue: string
  transactions: Transaction[]
  recentTransactions: Transaction[]
  tokens: Token[]
  isContract: boolean
  lastActive: string
  firstTxDate: string
  contractInfo?: ContractInfo
}

export default function useAddressDetails(address: string) {
  const [details, setDetails] = useState<AddressDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAddressDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Replace with your actual API endpoint
        const response = await fetch(`/api/address/${address}`)
        if (!response.ok) throw new Error('Failed to fetch address details')

        const data = await response.json()
        setDetails(data)
      } catch (err: any) {
        setError(err.message || 'An error occurred')
        setDetails(null)
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchAddressDetails()
    }
  }, [address])

  return { details, loading, error }
}
