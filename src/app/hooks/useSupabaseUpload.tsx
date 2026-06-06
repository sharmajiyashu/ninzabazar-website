import { useState } from 'react'

export const useSupabaseUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File, path: string, bucket = 'business-documents', folder = '') => {
    try {
      setIsUploading(true)
      setError(null)
      setProgress(0)

      // Create form data for the API route
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      formData.append('folder', folder)

      // Upload progress simulation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5
          return newProgress < 95 ? newProgress : prev
        })
      }, 100)

      // Call the API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      setProgress(100)
      const data = await response.json()

      return {
        path: data.path,
        fullPath: data.fullPath,
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error uploading file'
      setError(errorMessage)
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadFile, isUploading, progress, error }
}
