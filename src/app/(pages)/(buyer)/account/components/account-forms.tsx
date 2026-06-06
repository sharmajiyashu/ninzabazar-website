'use client'
import React, { useState } from 'react'
import { BuyerAccountPageProps, UserProps } from '@/app/types/type'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { Dayjs } from 'dayjs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const AccountForms: React.FC<BuyerAccountPageProps> = ({
  name,
  email,
  phoneNumber,
  dateOfBirth,
}) => {
  // State management
  // Update the initial state to only be true if dateOfBirth is null
  const [isEditingDOB, setIsEditingDOB] = useState(dateOfBirth === null) //eslint-disable-line
  const [currentDOB, setCurrentDOB] = useState<Dayjs | null>(() => {
    if (dateOfBirth) {
      // Try to parse with multiple formats to handle any potential format
      const parsedDate = dayjs(dateOfBirth, [
        'MM-DD-YYYY',
        'YYYY-MM-DD',
        'DD-MM-YYYY',
      ])
      return parsedDate.isValid() ? parsedDate : null
    }
    return null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(
    phoneNumber || ''
  )

  //ref for file input to connect file input with button
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // get session data
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  // get user data
  const { data: user } = useQuery<UserProps>({
    queryKey: ['user', session?.user.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
  })

  // handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file?.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    // Validate file size (e.g., max 5MB) 5 * kb * mb
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)

    // add preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // handle open file dialog
  const handleOpenFileDialog = () => {
    fileInputRef.current?.click()
  }

  // handle file upload to db
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

  //handle cancel selection
  const handleCancelSelection = () => {
    setSelectedFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Clear the file input
    }
  }
  const censorEmail = (email: string) => {
    const [local, domain] = email.split('@')
    if (!local || local.length <= 2) {
      return email // Return original if can't be parsed
    }
    return `${local[0]}***${local[local.length - 1]}@${domain}`
  }

  const censorPhoneNumber = (phoneNumber: string) => {
    return phoneNumber?.replace(/\d(?=\d{2})/g, '*') || ''
  }

  const handleDateChange = async (newValue: Dayjs | null) => {
    if (!newValue) return

    setCurrentDOB(newValue)
    setIsSubmitting(true)

    try {
      const formattedDate = newValue.format('YYYY-MM-DD')

      const response = await fetch('/api/auth/buyer-profile/POST', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateOfBirth: formattedDate }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Date of birth updated successfully')
        setIsEditingDOB(false)
      } else {
        toast.error(result.error || 'Failed to update date of birth')
      }
    } catch (error) {
      toast.error('An error occurred while updating your date of birth')
      console.error('Error updating date of birth:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add this new handler function
  const handlePhoneNumberUpdate = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/buyer-profile/POST', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactNumber: currentPhoneNumber }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Phone number updated successfully')
        setIsEditingPhone(false)
        // Update the cached user data
        queryClient.setQueryData(
          ['user', session?.user.id],
          (oldData: UserProps) => ({
            ...oldData,
            contactNumber: currentPhoneNumber,
          })
        )
      } else {
        toast.error(result.error || 'Failed to update phone number')
      }
    } catch (error) {
      toast.error('An error occurred while updating your phone number')
      console.error('Error updating phone number:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col mb-10 sm:mb-40">
        <div className="mb-8 flex item-start">
          <div className="space-y-4 text-center flex flex-col items-center">
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden border shadow-lg shadow-disabledgrey relative">
              <Image
                src={
                  imagePreview ||
                  user?.profilePicture ||
                  '/default-user-img.jpg'
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
        </div>
        <div className="flex flex-col items-start gap-4 text-lg font-medium sm:flex-row sm:items-center sm:gap-20 sm:text-xl">
          <span>Name:</span>
          <Input
            className="w-full sm:w-lg !text-base sm:!text-lg px-4 py-2 sm:py-4 font-normal"
            defaultValue={name}
            type="text"
            placeholder="Full Name"
            readOnly
            disabled
          />
        </div>
        <div className="mt-6 text-lg font-medium sm:text-xl">
          <span>Email:</span>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6">
            <a className="w-full sm:w-auto !text-sm sm:!text-md font-normal">
              {email ? censorEmail(email) : ''}
            </a>
          </div>
        </div>
        <div className="mt-6 text-lg font-medium sm:text-xl">
          <span>Phone Number:</span>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6">
            {isEditingPhone ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  className="w-full sm:w-64 !text-base sm:!text-lg px-4 py-2 font-normal"
                  value={currentPhoneNumber}
                  onChange={(e) => setCurrentPhoneNumber(e.target.value)}
                  type="tel"
                  placeholder="Phone Number"
                  disabled={isSubmitting}
                />
                <Button
                  onClick={handlePhoneNumberUpdate}
                  disabled={isSubmitting}
                  className="bg-green text-white hover:bg-green-600"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingPhone(false)
                    setCurrentPhoneNumber(phoneNumber || '')
                  }}
                  disabled={isSubmitting}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <a className="w-full sm:w-auto !text-sm sm:!text-md font-normal">
                  {phoneNumber
                    ? censorPhoneNumber(phoneNumber)
                    : 'Not provided'}
                </a>
                <Button
                  onClick={() => setIsEditingPhone(true)}
                  className="text-green hover:bg-green hover:text-white text-sm"
                  variant="link"
                >
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
        {/* Update the date of birth display section */}
        <div className="flex mt-4 text-lg font-medium flex-column sm:text-xl">
          <a className="mt-2">Date of Birth:</a>
          <div className="flex items-center">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {dateOfBirth === null ? (
                <DatePicker
                  value={currentDOB}
                  onChange={handleDateChange}
                  disabled={isSubmitting}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        width: '100%',
                        marginLeft: '20px',
                        backgroundColor: '#ffffff',
                        '& .MuiInputBase-input': {
                          padding: '12px 14px',
                          margin: '10px',
                          border: 1,
                          borderColor: '#007350',
                        },
                      },
                    },
                    popper: {
                      sx: {
                        '& .MuiPaper-root': {
                          borderRadius: '20px',
                          borderColor: '#007350',
                        },
                      },
                    },
                  }}
                />
              ) : (
                <DatePicker
                  disabled
                  value={currentDOB}
                  readOnly
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        width: '100%',
                        marginLeft: '20px',
                        backgroundColor: '#ffffff',
                        '& .MuiInputBase-input': {
                          padding: '12px 14px',
                          margin: '10px',
                          border: 1,
                          borderColor: '#007350',
                        },
                      },
                    },
                  }}
                />
              )}
            </LocalizationProvider>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountForms
