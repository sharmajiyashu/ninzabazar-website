import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { supabase } from '@/lib/supabaseClient'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// helper for safe url name
function createUrlSafeFilename(filename: string): string {
  const parts = filename.split('.') // splits the filename and extension (e.g., "image.jpg" -> ["image", "jpg"])
  const extension = parts.pop() // takes the file extension (e.g., "jpg") and removes it from the array
  const nameWithoutExt = parts.join('.') // joins the remaining parts back together (e.g., "image")

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
    const userId = session?.user?.id

    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = 'images'

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const fileExt = file.name.split('.').pop() // Extracts the file extension (e.g., "jpg")
    const fileName = file.name.replace(`.${fileExt}`, '') // Removes the extension from the original filename

    const sanitizedName = createUrlSafeFilename(fileName) // Sanitizes the filename
    const timestamp = Date.now() // Gets the current timestamp

    const uniqueFileName = `${sanitizedName}_${timestamp}.${fileExt}` // Constructs a unique filename
    const filePath = `profile-images/${userId}/${uniqueFileName}` // Constructs the file path

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    const arrayBuffer = await file.arrayBuffer() // Converts the file to an ArrayBuffer
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type, // Sets the content type of the file
        cacheControl: '86400', // 1 day before revalidation
        upsert: true, // Allows overwriting the file if it already exists
      })

    if (error) {
      console.error('Upload error', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Update the database with the new profile picture path
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: publicUrl },
      })

      return NextResponse.json({
        success: true,
        message: 'Profile picture updated successfully',
        profilePicture: updatedUser.profilePicture,
        filePath: data.path,
      })
    } catch (dbError) {
      console.error('Database update error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to update database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      {
        error: 'Internal server Error',
      },
      { status: 500 }
    )
  }
}
