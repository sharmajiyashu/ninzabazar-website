import axios from 'axios'

export const getSignedUrl = async (path: string) => {
  // Replace spaces with %20 if they exist
  const encodedPath = path.replace(/ /g, '%20')

  console.log('Original path:', path)
  console.log('Encoded path:', encodedPath)

  try {
    const response = await axios.post(
      '/api/seller-dashboard/business-details/get-signed-url',
      { filePath: encodedPath },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return response.data.signedUrl
  } catch (error) {
    console.log('Error getting signed URL:', error)
    return null
  }
}
