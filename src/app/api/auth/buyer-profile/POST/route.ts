import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get the current user session for authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Parse the request body
    const { dateOfBirth, address, contactNumber } = await request.json()

    // Update user data object
    const userData: any = {} //eslint-disable-line

    // Add dateOfBirth to update data if provided
    if (dateOfBirth) {
      userData.dateOfBirth = dateOfBirth
    }

    // Add contactNumber to update data if provided
    if (contactNumber !== undefined) {
      userData.contactNumber = contactNumber
    }

    // Only update user if we have data to update
    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userData,
      })
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

    // Handle address update
    if (address) {
      // If setting this address as default
      if (address.isDefault) {
        // First, set all other addresses for this buyer to non-default
        await prisma.address.updateMany({
          where: {
            buyerProfileId: buyerProfile.id,
            // Don't include the current address if it's an update
            ...(address.id ? { id: { not: address.id } } : {}),
          },
          data: {
            isDefault: false,
          },
        })
      }

      if (address.id) {
        // Update existing address
        await prisma.address.update({
          where: { id: address.id },
          data: {
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault || false,
            label: address.label || 'Other', // Add label field here
          },
        })
      } else {
        // Create new address
        await prisma.address.create({
          data: {
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault || false,
            label: address.label || 'Other', // Add label field here
            buyerProfileId: buyerProfile.id,
          },
        })
      }
    }

    return NextResponse.json(
      { success: true, message: 'Profile updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
