import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

function createUrlSafeFilename(filename: string): string {
  const parts = filename.split('.')
  const extension = parts.pop()
  const nameWithoutExt = parts.join('.')

  const sanitizedName = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Keep only alphanumeric and hyphens
    .replace(/-{2,}/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

  return extension ? `${sanitizedName}.${extension}` : sanitizedName
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'business-documents'
    const documentType = formData.get('documentType') as string
    const userId = session?.user?.id

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Extract file extension
    const fileExt = file.name.split('.').pop()
    const fileName = file.name.replace(`.${fileExt}`, '')

    // Sanitize the filename to remove spaces and special characters
    const safeFileName = createUrlSafeFilename(fileName)

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const uniqueFileName = `${safeFileName}_${timestamp}.${fileExt}`

    // Ensure userId is provided for proper folder structure
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required for file upload' },
        { status: 400 }
      )
    }

    // Create user-specific folder structure: userId/filename
    const filePath = `${userId}/${uniqueFileName}`

    console.log('Original filename:', file.name)
    console.log('Sanitized filename:', uniqueFileName)
    console.log('Constructed file path:', filePath)

    // Convert file to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (userId && documentType) {
      try {
        await updateSellerProfileDocument(userId, documentType, filePath)
      } catch (updateError) {
        console.error('Error updating sellerProfile:', updateError)
        console.error('Error details:', {
          userId,
          documentType,
          filePath,
        })
      }
    }

    return NextResponse.json({
      path: data.path,
      fullPath: filePath,
      originalName: file.name,
      sanitizedName: uniqueFileName,
      documentType,
    })
  } catch (error: unknown) {
    console.error('Server error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

async function updateSellerProfileDocument(
  userId: string,
  documentType: string,
  fileUrl: string
) {
  console.log(
    `Starting update for user ${userId} with document type ${documentType}`
  )
  console.log(`File URL to save: ${fileUrl}`)

  if (!fileUrl) {
    console.error('File URL is empty, aborting database update')
    return
  }

  try {
    // Use a transaction to ensure database consistency
    const result = await prisma.$transaction(async (prismaClient) => {
      // Find the sellerProfile first
      const sellerProfile = await prismaClient.sellerProfile.findUnique({
        where: { userId: userId },
      })

      if (!sellerProfile) {
        throw new Error(`SellerProfile for user with ID ${userId} not found`)
      }

      console.log(`Found sellerProfile with ID: ${sellerProfile.id}`)

      // Perform the update
      const updatedProfile = await prismaClient.sellerProfile.update({
        where: { id: sellerProfile.id },
        data: {
          businessDocumentFile: fileUrl,
        },
      })

      console.log(
        `Update successful, document URL: ${updatedProfile.businessDocumentFile}`
      )
      return updatedProfile
    })

    return result
  } catch (error) {
    console.error(`Database error during update:`, error)
    throw error
  }
}
