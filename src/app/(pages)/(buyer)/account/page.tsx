'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import AccountTabs from './components/account-tabs'
import { UserProps } from '@/app/types/type'

export default function BuyerAccountPage() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserProps | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      const res = await axios.get(
        `/api/auth/buyer-profile/GET?id=${session.user.id}`
      )
      setUserData(res.data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData()
    }
  }, [status, fetchUserData])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  if (!session || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Unable to load account. Please try again.
      </div>
    )
  }

  const formattedData = {
    name: `${userData.firstName} ${userData.lastName}`,
    email: userData.email,
    phoneNumber: userData.contactNumber,
    dateOfBirth: userData.dateOfBirth ?? '',
    addresses:
      userData.buyerProfile?.shippingAddresses?.map((address) => ({
        id: address.id,
        address: `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`,
        label: address.isDefault ? 'Home' : 'Other',
      })) ?? [],
  }

  return <AccountTabs {...formattedData} />
}
