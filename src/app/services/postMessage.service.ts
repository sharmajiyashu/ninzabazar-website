import axios from 'axios'

export async function sendMessage(conversationId: string, content: string) {
  try {
    const response = await axios.post('/api/messages/post', {
      conversationId,
      content,
    })
    return response.data
  } catch (error) {
    // You can customize the error handling as needed
    console.error('Failed to post message:', error)
    throw error
  }
}
