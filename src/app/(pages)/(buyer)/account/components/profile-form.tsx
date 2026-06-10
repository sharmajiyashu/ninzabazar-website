'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import {
  Camera,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UserProps } from '@/app/types/type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ProfileFormProps = {
  name: string
  email: string
  phoneNumber: string
  location: string
}

export function ProfileForm({
  name,
  email,
  phoneNumber,
  location,
}: ProfileFormProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName] = useState(name)
  const [emailValue] = useState(email)
  const [phone, setPhone] = useState(phoneNumber || '')
  const [locationValue] = useState(location || 'Not set')
  const [language, setLanguage] = useState('english')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { data: user } = useQuery<UserProps>({
    queryKey: ['user', session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
    enabled: !!session?.user?.id,
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file?.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const uploadProfilePicture = async () => {
    if (!selectedFile) return
    try {
      setIsUpdating(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      const res = await axios.post('/api/changePFP/post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data.success) {
        queryClient.invalidateQueries({ queryKey: ['user', session?.user?.id] })
        setImagePreview(null)
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        toast.success('Profile picture updated')
      }
    } catch {
      toast.error('Failed to update profile picture')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdate = async () => {
    setIsSaving(true)
    try {
      if (selectedFile) {
        await uploadProfilePicture()
      }

      if (phone !== phoneNumber) {
        const response = await fetch('/api/auth/buyer-profile/POST', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contactNumber: phone }),
        })
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to update profile')
        }
      }

      toast.success('Profile updated successfully')
      queryClient.invalidateQueries({ queryKey: ['buyer-profile'] })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const profileImage =
    imagePreview || user?.profilePicture || '/default-user-img.jpg'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">My Profile</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex shrink-0 flex-col items-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-md sm:h-32 sm:w-32">
            <Image
              src={profileImage}
              alt="Profile"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition hover:bg-orange-600"
              aria-label="Change profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="grid flex-1 gap-5 sm:grid-cols-2">
          <Field label="Full Name" icon={<User className="h-4 w-4" />}>
            <Input
              value={fullName}
              readOnly
              disabled
              className="h-11 border-gray-200 bg-gray-50 pl-10"
            />
          </Field>

          <label className="block space-y-2 sm:col-span-1">
            <span className="text-sm font-medium text-gray-700">Phone Number</span>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                +91
              </span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="h-11 border-gray-200 pl-[4.5rem]"
                placeholder="1234567890"
              />
            </div>
          </label>

          <Field label="Email Address" icon={<Mail className="h-4 w-4" />}>
            <Input
              value={emailValue}
              readOnly
              disabled
              className="h-11 border-gray-200 bg-gray-50 pl-10"
            />
          </Field>

          <Field label="Location" icon={<MapPin className="h-4 w-4" />}>
            <Input
              value={locationValue}
              readOnly
              disabled
              className="h-11 border-gray-200 bg-gray-50 pl-10 pr-10"
            />
          </Field>

          <Field label="Language" icon={<Globe className="h-4 w-4" />}>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-11 w-full border-gray-200 pl-10">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={() => void handleUpdate()}
          disabled={isSaving || isUpdating}
          className="h-11 min-w-[140px] rounded-lg bg-[#006d44] px-8 text-sm font-bold uppercase tracking-wide hover:bg-[#005a36]"
        >
          {isSaving || isUpdating ? 'Updating...' : 'Update'}
        </Button>
      </div>
    </div>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        {children}
      </div>
    </label>
  )
}
