import { prisma } from '@/lib/prisma'

export const conversationService = {
  async getBuyerConversations(userId: string) {
    return await prisma.conversation
      .findMany({
        where: {
          buyerId: userId,
        },
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              sellerProfile: {
                select: {
                  id: true,
                  shopName: true,
                  businessRegisteredName: true,
                  companyName: true,
                  isVerified: true,
                  createdAt: true,
                  products: true,
                  storeRatingSummary: {
                    select: {
                      average: true,
                      totalCount: true,
                    },
                  },
                },
              },
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: {
                select: {
                  urlpath: true,
                  isDefault: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              sentAt: 'desc',
            },
            take: 1, // Get only the latest message
            select: {
              id: true,
              content: true,
              senderId: true,
              sentAt: true,
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            updatedAt: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
      })
      .then((conversations) => {
        // Transform data to match your frontend interface
        return conversations.map((conv) => ({
          ...conv,
          isActive: false, // You might need to determine this based on your business logic
          hasUnread: false, // You might need to determine this based on message status
          createdAt: conv.createdAt.toLocaleDateString(),
          updatedAt: conv.updatedAt.toLocaleDateString(),
          seller: {
            ...conv.seller,
            sellerProfile: {
              ...conv.seller.sellerProfile,
              createdAt: conv.seller.sellerProfile?.createdAt
                ? conv.seller.sellerProfile.createdAt.toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' }
                  )
                : null,
            },
          },
        }))
      })
  },

  async getSellerConversations(userId: string) {
    return await prisma.conversation
      .findMany({
        where: {
          sellerId: userId,
        },
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              createdAt: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              sellerProfile: {
                select: {
                  id: true,
                  shopName: true,
                  businessRegisteredName: true,
                  companyName: true,
                  isVerified: true,
                  createdAt: true,
                  products: true,
                  storeRatingSummary: {
                    select: {
                      average: true,
                      totalCount: true,
                    },
                  },
                },
              },
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: {
                select: {
                  urlpath: true,
                  isDefault: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              sentAt: 'desc',
            },
            take: 1, // Get only the latest message
            select: {
              id: true,
              content: true,
              conversationId: true,
              senderId: true,
              sentAt: true,
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      })
      .then((conversations) => {
        // Transform data to match your frontend interface
        return conversations.map((conv) => ({
          ...conv,
          isActive: false,
          hasUnread: false,
          buyer: {
            ...conv.buyer,
            createdAt: conv.buyer?.createdAt
              ? conv.buyer.createdAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null,
          },
        }))
      })
  },
}
