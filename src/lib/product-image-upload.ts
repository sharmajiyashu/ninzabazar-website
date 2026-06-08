import { getSupabaseAdmin, getSupabaseConfigError } from '@/lib/supabaseClient'
import { randomUUID } from 'crypto'

/** Same bucket as create product — must match Supabase Storage bucket id */
const PRODUCT_IMAGE_BUCKET = 'images/product-images'

export function getValidImageFiles(formData: FormData): File[] {
  return formData
    .getAll('productImages')
    .filter(
      (item): item is File =>
        item instanceof File && item.size > 0 && item.type.startsWith('image/')
    )
}

export async function uploadProductImages(
  files: File[]
): Promise<{ urls: string[]; error?: string }> {
  if (files.length === 0) return { urls: [] }

  const configError = getSupabaseConfigError()
  if (configError) {
    return { urls: [], error: configError }
  }

  const supabase = getSupabaseAdmin()

  const uploadResults = await Promise.all(
    files.map(async (image, index) => {
      const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filename = `${Date.now()}_${randomUUID()}_${index}_${safeName}`
      const arrayBuffer = await image.arrayBuffer()

      return supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(filename, new Uint8Array(arrayBuffer), {
          contentType: image.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        })
    })
  )

  const failedUploads = uploadResults.filter((result) => result.error)
  if (failedUploads.length > 0) {
    console.error('Upload errors:', failedUploads.map((r) => r.error))
    const firstError = failedUploads[0].error?.message || 'Unknown upload error'

    if (firstError.includes('Invalid Compact JWS') || firstError.includes('JWT')) {
      return {
        urls: [],
        error:
          'Supabase auth failed. Check NEXT_PUBLIC_SUPABASE_ANON_KEY or add SUPABASE_SECRET_KEY from Supabase Dashboard → Settings → API Keys.',
      }
    }

    if (firstError.includes('Bucket not found')) {
      return {
        urls: [],
        error: `Storage bucket "${PRODUCT_IMAGE_BUCKET}" not found. Create it in Supabase Dashboard → Storage.`,
      }
    }

    return { urls: [], error: firstError }
  }

  const publicUrls = uploadResults.map((result) =>
    supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .getPublicUrl(result.data?.path || '')
  )

  return { urls: publicUrls.map((url) => url.data.publicUrl) }
}
