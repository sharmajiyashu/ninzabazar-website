'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import axios from 'axios'
import AccountTabs from './components/account-tabs'
import { UserProps } from '@/app/types/type'

export default function BuyerAccountPage() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserProps | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) {
      return redirect('/login')
    }

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
  }, [session])

  useEffect(() => {
    if (status !== 'loading') {
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
    redirect('/account')
  }

  const formattedData = {
    name: `${userData.firstName} ${userData.lastName}`,
    email: userData.email,
    phoneNumber: userData.contactNumber,
    dateOfBirth: userData.dateOfBirth,
    addresses:
      userData.buyerProfile?.shippingAddresses?.map((address) => ({
        id: address.id,
        address: `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`,
        label: address.isDefault ? 'Home' : 'Other',
        isDefault: address.isDefault,
      })) || [],
    refreshData: fetchUserData,
  }

  return (
    <div className="page-container animate-fade-up">
      <AccountTabs {...formattedData} />
    </div>
  )
}
