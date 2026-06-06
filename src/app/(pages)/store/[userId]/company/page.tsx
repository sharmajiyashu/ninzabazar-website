'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Mail,
  Phone,
  FileText,
  RotateCcw,
  Truck,
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

import Banner from '../../banner'
import { SellerProfileProps } from '@/app/types/type'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CompanyDetails = () => {
  const { userId } = useParams() as { userId: string }
  const [page, setPage] = useState(1) // eslint-disable-line
  const limit = 10

  const {
    data: seller,
    error,
    isLoading,
  } = useQuery<
    SellerProfileProps & {
      totalProducts: number
      currentPage: number
      totalPages: number
    }
  >({
    queryKey: ['seller', userId, page],
    queryFn: async () => {
      const res = await axios.get(
        `/api/getSellerProfile?userId=${userId}&page=${page}&limit=${limit}`
      )
      return res.data
    },
    enabled: !!userId,
  })

  // Helper function to format business type in Pascal Case
  const formatBusinessType = (type: string | undefined) => {
    if (!type) return ''
    return type
      .split(/[\s_-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-ping opacity-75"></div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-600 animate-pulse">
              Loading company details...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <div className="bg-white rounded-full p-4 shadow-lg mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              We couldn&apos;t load the company details. Please try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const profile = seller

  // Merged Business Information and Contact Info
  const businessInfo = [
    // Only show company name if it exists and is not empty
    ...(profile.companyName
      ? [
          {
            icon: Building2,
            label: 'Company Name',
            value: profile.companyName,
            color: 'from-green-500 to-emerald-500',
          },
        ]
      : []),
    // Show business type with Pascal Case formatting
    ...(profile.businessType
      ? [
          {
            icon: Globe,
            label: 'Business Type',
            value: formatBusinessType(profile.businessType),
            color: 'from-green-600 to-lime-500',
          },
        ]
      : []),
    // Only show business email if it exists
    ...(profile.businessEmail
      ? [
          {
            icon: Mail,
            label: 'Business Email',
            value: profile.businessEmail,
            color: 'from-yellow-500 to-amber-500',
          },
        ]
      : []),
    // Only show business phone if it exists
    ...(profile.businessPhoneNumber
      ? [
          {
            icon: Phone,
            label: 'Business Phone',
            value: profile.businessPhoneNumber,
            color: 'from-yellow-600 to-orange-500',
          },
        ]
      : []),
  ]

  const termsInfo = [
    {
      icon: RotateCcw,
      label: 'Returns Policy',
      value: profile.returnsTerms,
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Truck,
      label: 'Shipping Terms',
      value: profile.shippingTerms,
      color: 'from-amber-500 to-orange-600',
    },
  ]

  const NavigationLinks: Record<string, string> = {
    Home: `/store/${userId}`,
    Company: `/store/${userId}/company`,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      {/* Enhanced Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative w-full py-16 flex justify-center items-center">
          <Banner sellerInfo={seller} />
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="relative -mt-8">
        <div className="flex justify-center px-4 md:px-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-2">
            <div className="flex space-x-1">
              {Object.entries(NavigationLinks).map(([name, href]) => (
                <div key={name} className="relative group">
                  <Link
                    href={href}
                    className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                      name === 'Company'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {name === 'Home' && <Globe className="w-5 h-5" />}
                    {name === 'Company' && <Building2 className="w-5 h-5" />}
                    {name === 'Home' ? 'Store' : name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Company Details Section */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Company Information
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive details about our business, contact information, and
            policies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
          {/* Merged Business Information and Contact Card */}
          {businessInfo.length > 0 && (
            <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Building2 className="w-6 h-6" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {businessInfo.map(
                    ({ icon: Icon, label, value, color }, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 group hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50 rounded-lg p-3 transition-colors"
                      >
                        <div
                          className={`w-10 h-10 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            {label}
                          </p>
                          <p className="text-gray-900 font-semibold break-words">
                            {value || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description Card */}
        <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <FileText className="w-6 h-6" />
              Company Description
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {profile.description ||
                  'No description provided for this company.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Policies Card */}
        <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <FileText className="w-6 h-6" />
              Shipping & Returns
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {termsInfo.map(({ icon: Icon, label, value, color }, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {label}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {value || 'No terms specified'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Spacing */}
      <div className="h-20" />
    </div>
  )
}

export default CompanyDetails
