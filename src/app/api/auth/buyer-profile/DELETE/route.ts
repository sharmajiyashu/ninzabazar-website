import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Get the current user session for authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Parse the request body
    const { addressId } = await request.json()

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      )
    }

    // Find the buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
      include: { shippingAddresses: true },
    })

    if (!buyerProfile) {
      return NextResponse.json(
        { error: 'Buyer profile not found' },
        { status: 404 }
      )
    }

    // Check if address belongs to this user
    const addressExists = buyerProfile.shippingAddresses.some(
      (address) => address.id === addressId
    )

    if (!addressExists) {
      return NextResponse.json(
        { error: 'Address not found for this user' },
        { status: 404 }
      )
    }

    // Delete the address
    await prisma.address.delete({
      where: { id: addressId },
    })

    return NextResponse.json(
      { success: true, message: 'Address deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete address',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
