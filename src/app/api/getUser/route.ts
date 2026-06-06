import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }
    const getUser = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        middleName: true,
        suffix: true,
        contactNumber: true,
        createdAt: true,
        updatedAt: true,
        profilePicture: true,
        // password is excluded by not selecting it
        sellerProfile: {
          select: {
            id: true,
            companyName: true,
            description: true,
            createdAt: true,
            products: true,
            storeRatingSummary: true,
            isVerified: true,
            businessDocumentFile: true,
            businessDocumentType: true,
            businessEmail: true,
            businessPhoneNumber: true,
            businessRegisteredName: true,
            businessType: true,
            individualRegisteredName: true,
            shopName: true,
            returnsTerms: true,
            sellerEmail: true,
            sellerPhoneNumber: true,
            registeredAddress: true,
            pickupAddress: true,
          },
        },
        buyerProfile: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            shippingAddresses: {
              select: {
                id: true,
                street: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                isDefault: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            orders: {
              select: {
                id: true,
                status: true,
                totalAmount: true,
                buyerId: true,
                deliveryVerifiedAt: true,
                isPaymentReleased: true,
                createdAt: true,
                updatedAt: true,
                orderItems: {
                  select: {
                    id: true,
                    quantity: true,
                    productName: true,
                    variant: {
                      select: {
                        id: true,
                        title: true,
                        option: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    return NextResponse.json(getUser)
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
