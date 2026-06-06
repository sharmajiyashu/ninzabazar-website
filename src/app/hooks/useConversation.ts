import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = '/api/conversations/get'
export function useBuyerConversations(userId: string) {
  return useQuery({
    queryKey: ['buyerConversations', userId],
    queryFn: async () => {
      const response = await axios.get(API_URL, {
        headers: {
          userId: userId,
          userRole: 'BUYER',
        },
      })
      return response.data
    },
    enabled: !!userId, // Only run the query if userId is available
  })
}

export function useSellerConversations(userId: string) {
  return useQuery({
    queryKey: ['sellerConversations', userId],
    queryFn: async () => {
      const response = await axios.get(API_URL, {
        headers: {
          userId: userId,
          userRole: 'SELLER',
        },
      })
      return response.data
    },
    enabled: !!userId, // Only run the query if userId is available
  })
}
