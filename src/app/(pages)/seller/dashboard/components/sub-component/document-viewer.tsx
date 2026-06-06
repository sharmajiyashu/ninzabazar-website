import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { FileText, Download, AlertCircle } from 'lucide-react'
import { getSignedUrl } from '@/lib/getSignedURL'

interface DocumentViewerProps {
  filePath: string
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ filePath }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        setLoading(true)
        setError(null)

        // Validate filePath
        if (!filePath || filePath.trim() === '') {
          throw new Error('No file path provided')
        }

        console.log('Fetching signed URL for:', filePath)
        const url = await getSignedUrl(filePath)

        if (!url) {
          throw new Error('No URL returned from getSignedUrl')
        }

        setSignedUrl(url)
        console.log('Successfully set signed URL')
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load document'
        setError(errorMessage)
        console.error('Error fetching signed URL:', err)
      } finally {
        setLoading(false)
      }
    }

    if (filePath) {
      fetchSignedUrl()
    } else {
      setLoading(false)
      setError('No file path provided')
    }
  }, [filePath])

  const handleViewDocument = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDownloadDocument = () => {
    if (signedUrl) {
      const link = document.createElement('a')
      link.href = signedUrl
      // Try to extract filename from filePath, fallback to timestamp
      const filename =
        filePath.split('/').pop() || `business-document-${Date.now()}`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading...</span>
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewDocument}
        className="flex items-center gap-1"
        disabled={!signedUrl}
      >
        <FileText className="w-4 h-4" />
        View
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadDocument}
        className="flex items-center gap-1"
        disabled={!signedUrl}
      >
        <Download className="w-4 h-4" />
        Download
      </Button>
    </div>
  )
}

export default DocumentViewer
