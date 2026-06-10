'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { ProfileBreadcrumb } from './components/profile-breadcrumb'
import { ProfileForm } from './components/profile-form'
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
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  if (!session || !userData) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white">
        <p className="text-gray-500">Unable to load account. Please try again.</p>
      </div>
    )
  }

  const defaultAddress = userData.buyerProfile?.shippingAddresses?.find(
    (a) => a.isDefault
  )
  const location = defaultAddress
    ? `${defaultAddress.city}, ${defaultAddress.state}`
    : 'Not set'

  return (
    <>
      <ProfileBreadcrumb items={[{ label: 'Profile' }]} />
      <ProfileForm
        name={`${userData.firstName} ${userData.lastName}`.trim()}
        email={userData.email}
        phoneNumber={userData.contactNumber}
        location={location}
      />
    </>
  )
}
