import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        contactNumber: true,
        profilePicture: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
        buyerProfile: {
          include: {
            shippingAddresses: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Transform the address data for the front-end
    const formattedUser = {
      ...user,
      addresses:
        user.buyerProfile?.shippingAddresses.map((addr) => ({
          id: addr.id,
          label: addr.label || (addr.isDefault ? 'Default' : 'Other'), // Use the label from DB
          address: `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`,
          isDefault: addr.isDefault,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
        })) || [],
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('Error fetching buyer profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
