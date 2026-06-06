'use client'

import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import razorPay from '../../../../../public/razor-pay.png'
import paypal from '../../../../../public/paypal.png'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

interface WalletData {
  id: string
  availableBalance: number
  pendingBalance: number
  recentTransactions: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
    updatedAt: string
  }>
}

const Page = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line
  const [paymentMethods, setPaymentMethods] = useState([
    { type: 'RazorPay', account: 'johndoe@example.com' },
    { type: 'PayPal', account: 'johndoe@example.com' },
  ])

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/wallet')

        if (!response.ok) {
          throw new Error('Failed to fetch wallet data')
        }

        const data = await response.json()
        setWalletData(data.wallet)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching wallet data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  return (
    <>
      {/* Main Content */}
      <div className="flex-1 my-10 px-4 md:my-20 md:px-12 lg:px-20 xl:mx-20 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between w-full gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">
            Receive Payments
          </h1>
          <Button className="bg-green px-4 py-3 md:px-6 md:py-4 rounded-md">
            Get Paid Now
          </Button>
        </div>

        {/* Wallet Data */}
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-green" />
            <span className="ml-2">Loading wallet data...</span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg my-6">
            <p className="text-red-600">Error: {error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        ) : walletData ? (
          <div>
            {/* Balance Section */}
            <div className="flex flex-col border border-gray-400 w-full md:w-82 p-6 md:p-10 items-center my-6 md:my-10 rounded-3xl">
              <h2 className="text-lg md:text-xl font-bold">
                Available Balance
              </h2>
              <p className="text-lg md:text-xl font-bold text-green">
                ${walletData.availableBalance.toFixed(2)}
              </p>
              <p className="text-gray-500">
                ${walletData.pendingBalance.toFixed(2)} pending
              </p>
            </div>

            {/* Recent Transactions */}
            {walletData.recentTransactions.length > 0 && (
              <div className="border border-gray-400 p-6 md:p-10 rounded-3xl mb-6">
                <h2 className="text-lg md:text-xl font-bold mb-4">
                  Recent Transactions
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                        <th className="px-4 py-2 text-center">Status</th>
                        <th className="px-4 py-2 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletData.recentTransactions.map((tx) => (
                        <tr key={tx.id} className="border-t">
                          <td className="px-4 py-2 text-left truncate max-w-[100px]">
                            {tx.id}
                          </td>
                          <td className="px-4 py-2 text-right">
                            ${Number(tx.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                tx.status === 'RELEASED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            {new Date(tx.updatedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Withdrawal Methods */}
            <div className="space-y-4 border border-gray-400 p-6 md:p-10 rounded-3xl">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <h2 className="text-lg md:text-xl font-bold">
                  Withdrawal Method
                </h2>
                <Button className="px-4 py-3 md:px-7 md:py-4 rounded-full bg-white border border-green text-green hover:bg-green-50">
                  Add a Method
                </Button>
              </div>

              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row justify-between items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={method.type === 'RazorPay' ? razorPay : paypal}
                      alt={method.type.toLowerCase()}
                      width={30}
                      height={10}
                    />
                    <h2 className="text-base md:text-lg font-semibold">
                      {method.type} - {method.account}
                    </h2>
                  </div>
                  <Button className="px-6 py-3 md:px-11.5 md:py-4 border border-orange text-orange bg-white rounded-full hover:bg-orange-50">
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg my-6">
            <p>No wallet data available. Please try again later.</p>
          </div>
        )}
      </div>
    </>
  )
}

export default Page
