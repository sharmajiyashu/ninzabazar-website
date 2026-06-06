'use client'
import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { SquarePen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { UserProps } from '@/app/types/type'
import { formatPhoneNumber } from '@/lib/phoneNumFormatter'
import CompanyDetails from './company-details'
import BusinessInformation from './business-information'

const Dashboard = () => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeComponent, setActiveComponent] =
    useState<string>('basic details')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  const { data: user } = useQuery<UserProps>({
    queryKey: ['user', session?.user.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
  })

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle opening file dialog
  const handleOpenFileDialog = () => {
    fileInputRef.current?.click()
  }

  // Handle profile picture upload
  const handleUploadProfilePicture = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    try {
      setIsUpdating(true)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Upload to your API endpoint
      const res = await axios.post('/api/changePFP/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (res.data.success) {
        // Update the user query cache with new profile picture
        queryClient.setQueryData(
          ['user', session?.user.id],
          (oldData: UserProps) => ({
            ...oldData,
            profilePicture: res.data.profilePicture,
          })
        )

        console.log('Profile picture updated:', res.data.profilePicture)

        // Clear preview and selected file
        setImagePreview(null)
        setSelectedFile(null)

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        alert('Profile picture updated successfully!')
      }
    } catch (error) {
      console.error('Error changing profile picture:', error)
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data)
        console.error('Response status:', error.response?.status)
      }
      alert('Failed to update profile picture. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Cancel image selection
  const handleCancelSelection = () => {
    setSelectedFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="m-4 md:m-10">
      <div className="flex flex-col md:flex-row md:space-x-5 space-y-5 md:space-y-0">
        {/* Profile Image + Edit Controls */}
        <div className="space-y-4 text-center flex flex-col items-center">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border shadow-lg shadow-disabledgrey relative">
            <Image
              src={
                imagePreview || user?.profilePicture || '/default-user-img.jpg'
              }
              alt="Profile"
              width={100}
              height={100}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            {!selectedFile ? (
              <Button
                onClick={handleOpenFileDialog}
                disabled={isUpdating}
                className="bg-white border border-green hover:bg-green hover:text-white text-sm text-green flex items-center"
              >
                Change Image
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleUploadProfilePicture}
                  disabled={isUpdating}
                  className="bg-green text-white hover:bg-green-600 text-sm flex items-center"
                >
                  {isUpdating ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Button
                  onClick={handleCancelSelection}
                  disabled={isUpdating}
                  variant="outline"
                  className="text-sm"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Parent div with gap for spacing */}
        <div className="flex flex-col md:flex-row justify-start my-5 gap-5 md:gap-20">
          {/* Welcome Message */}
          <div className="flex flex-col justify-start space-y-2 text-md md:text-xl">
            <p>Welcome Back,</p>
            <p className="flex items-center justify-between space-x-4">
              <span>
                {user?.sellerProfile?.companyName ||
                  user?.sellerProfile?.businessRegisteredName}
              </span>
              <button className="cursor-pointer">
                <SquarePen size={16} />
              </button>
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-start space-y-2 text-md md:text-xl">
            <p className="flex items-center justify-between space-x-4">
              <span>Email: {user?.email}</span>
              <button className="cursor-pointer">
                <SquarePen size={16} />
              </button>
            </p>
            <p className="flex items-center justify-between space-x-4">
              <span>
                Contact Number: {formatPhoneNumber(user?.contactNumber || '')}
              </span>
              <button className="cursor-pointer">
                <SquarePen size={16} />
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-disabledbg py-4 px-6 rounded-xl">
        <div className="flex flex-col md:flex-row justify-start items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
          <button
            onClick={() => setActiveComponent('basic details')}
            className={`px-4 py-2 font-semibold cursor-pointer ${
              activeComponent === 'basic details'
                ? 'bg-disabledbutton text-black rounded-lg shadow-md'
                : 'text-disabledgrey'
            }`}
          >
            Basic Company Details
          </button>
          <button
            onClick={() => setActiveComponent('business details')}
            className={`px-4 py-2 font-semibold cursor-pointer ${
              activeComponent === 'business details'
                ? 'bg-disabledbutton text-black rounded-lg shadow-md'
                : 'text-disabledgrey'
            }`}
          >
            Business Information
          </button>
        </div>
      </div>

      <div className="border-disablegrey rounded-2xl border-2 w-full p-4 md:p-10 mt-4">
        {activeComponent === 'basic details' && <CompanyDetails />}
        {activeComponent === 'business details' && <BusinessInformation />}
      </div>
    </div>
  )
}

export default Dashboard
