import React from 'react'
import SoleProprietorship from './components/sole-proprietorship'
import { Button } from '@/components/ui/button'
import CorporateEntityInformation from './components/corporation'
import OnePersonCorporation from './components/one-person-corporation'
import {
  BusinessEntityData,
  isSoleProprietorship,
  isCorporation,
  isOnePersonCorporation,
  UserProps,
} from '@/app/types/type'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const BusinessInformation: React.FC = () => {
  const { data: session } = useSession()

  // Data fetching
  const { data: user } = useQuery<UserProps>({
    queryKey: ['buyerProfile', session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
    enabled: !!session?.user?.id,
  })

  const seller = user?.sellerProfile

  if (!seller) return null

  const getAddressString = () => {
    if (!user?.sellerProfile?.registeredAddress) return ''

    // If it's an array, take the first address
    const addresses = Array.isArray(user.sellerProfile.registeredAddress)
      ? user.sellerProfile.registeredAddress[0]
      : user.sellerProfile.registeredAddress

    if (!addresses) return ''

    return `${addresses.street}, ${addresses.city} ${addresses.state} ${addresses.postalCode} ${addresses.country}`
  }

  // Convert seller profile to BusinessEntityData format
  const createBusinessEntity = (
    seller: NonNullable<UserProps['sellerProfile']>
  ): BusinessEntityData | null => {
    if (!seller.businessType) return null

    const baseEntity = {
      id: parseInt(seller.id), // Convert string to number
      businessRegisteredName: seller.businessRegisteredName || '',
      registeredAddress: getAddressString() || '',
      businessDocumentType: seller.businessDocumentType || '',
      businessDocumentFile: seller.businessDocumentFile || '',
      businessEmail: seller.businessEmail || '',
      businessPhoneNumber: seller.businessPhoneNumber || '',
      companyRegisteredName: seller.companyName || '',
    }

    switch (seller.businessType) {
      case 'solePropriator':
        return {
          ...baseEntity,
          businessType: 'solePropriator',
          individualRegisteredName: seller.individualRegisteredName || '',
        }
      case 'corporation':
        return {
          ...baseEntity,
          businessType: 'corporation',
        }
      case 'onePersonCorpo':
        return {
          ...baseEntity,
          businessType: 'onePersonCorpo',
          individualRegisteredName: seller.individualRegisteredName || '',
        }
      default:
        return null
    }
  }

  const businessEntity = createBusinessEntity(seller)
  const businessEntities = businessEntity ? [businessEntity] : []

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-semibold">
          Entity Information
        </h1>
        <Button className="bg-green text-white hover:border hover:border-green hover:bg-white hover:text-green px-6 md:px-10">
          Edit
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        {businessEntities.length > 0 ? (
          businessEntities.map((data) => {
            if (isSoleProprietorship(data)) {
              return <SoleProprietorship key={data.id} {...data} />
            }
            if (isCorporation(data)) {
              return <CorporateEntityInformation key={data.id} {...data} />
            }
            if (isOnePersonCorporation(data)) {
              return <OnePersonCorporation key={data.id} {...data} />
            }
            return null
          })
        ) : (
          <div className="text-gray-500">
            No business entity information found.
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessInformation
