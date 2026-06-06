import prisma from '@/lib/prisma'

export const messageService = {
  async getMessages(conversationId: string) {
    return await prisma.message
      .findMany({
        where: {
          conversationId: conversationId,
        },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          sentAt: true,
          updatedAt: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              role: true,
            },
          },
          attachments: {
            select: {
              id: true,
              fileUrl: true,
              fileType: true,
            },
          },
          statuses: {
            select: {
              id: true,
              status: true,
              userId: true,
              updatedAt: true,
            },
          },
        },
        orderBy: {
          sentAt: 'asc',
        },
      })
      .then((messages) => {
        return messages.map((message) => {
          return {
            ...message,
            sentAt: message.sentAt.toLocaleTimeString(),
            updatedAt: message.updatedAt.toLocaleTimeString(),
          }
        })
      })
  },
}
