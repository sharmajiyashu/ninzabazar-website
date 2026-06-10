import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

export async function getAuthenticatedSellerProfile() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  return prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, userId: true, companyName: true },
  })
}

export async function sellerOwnsOrder(
  sellerId: string,
  orderId: string
): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      orderItems: {
        some: {
          OR: [{ sellerId }, { product: { sellerId } }],
        },
      },
    },
    select: { id: true },
  })

  return Boolean(order)
}
