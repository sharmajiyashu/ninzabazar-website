import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function useGetMessage(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await axios.get('/api/messages/get', {
        headers: {
          conversationId: conversationId,
        },
      })
      return response.data
    },
    enabled: !!conversationId, // Only run the query if conversationId is available
  })
}
