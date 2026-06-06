import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'

export async function POST(request: Request) {
  try {
    // Get the user session to verify authorization
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Get user email from session
    const email = session.user?.email
    if (!email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    const formData = await request.formData()

    const shopName = formData.get('shopName') as string
    const businessType = formData.get('businessType') as string
    const businessRegisteredName = formData.get(
      'businessRegisteredName'
    ) as string
    const individualRegisteredName = formData.get(
      'individualRegisteredName'
    ) as string
    const registeredAddress = formData.get('registeredAddress') as string
    const businessDocumentType = formData.get('businessDocumentType') as string
    const businessEmail = formData.get('businessEmail') as string
    const businessPhoneNumber = formData.get('businessPhoneNumber') as string
    const companyName = formData.get('companyName') as string
    const pickupAddress = formData.get('pickupAddress') as string
    const sellerEmail = formData.get('sellerEmail') as string
    const sellerPhoneNumber = formData.get('sellerPhoneNumber') as string
    const shippingTerms = formData.get('shippingTerms') as string
    const returnsTerms = formData.get('returnsTerms') as string

    // Handle the file upload
    const businessDocumentUrl = formData.get('businessDocumentFile') as string
    console.log('Received document URL:', businessDocumentUrl)

    // Use a simple non-empty check
    let finalDocumentUrl = businessDocumentUrl

    // For null safety, ensure we never save null (use empty space if needed)
    if (!finalDocumentUrl || finalDocumentUrl === '') {
      finalDocumentUrl = ' '
    }

    // Validate required fields
    if (!shopName) {
      return NextResponse.json(
        { error: 'Shop name is required' },
        { status: 400 }
      )
    }

    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      )
    }

    // Find the user
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { sellerProfile: true },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!existingUser.sellerProfile) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      )
    }

    console.log(
      'businessDocumentFileUrl:',
      formData.get('businessDocumentFileUrl')
    )
    console.log('businessDocumentFile:', formData.get('businessDocumentFile'))

    // Update seller profile with all form data
    const updatedSellerProfile = await prisma.sellerProfile.update({
      where: { id: existingUser.sellerProfile.id },
      data: {
        shopName,
        businessType,
        businessRegisteredName,
        individualRegisteredName,
        businessEmail,
        businessPhoneNumber,
        companyName,
        businessDocumentType,
        businessDocumentFile: finalDocumentUrl,
        sellerEmail,
        sellerPhoneNumber,
        shippingTerms,
        returnsTerms,
        storeStatus: 'pending',
      },
    })

    // Fix type errors with explicit typing
    let pickupAddressParts: string[] = []
    let businessAddressParts: string[] = []

    if (pickupAddress && pickupAddress.trim()) {
      pickupAddressParts = pickupAddress.split(',').map((part) => part.trim())

      if (registeredAddress && registeredAddress.trim()) {
        businessAddressParts = registeredAddress
          .split(',')
          .map((part) => part.trim())

        // Ensure we have enough parts - log warning if not
        if (businessAddressParts.length < 5) {
          console.warn(
            `Business address doesn't have enough parts: ${registeredAddress}`
          )
        }
      }

      if (pickupAddressParts.length < 5) {
        console.warn(
          `Pickup address doesn't have enough parts: ${pickupAddress}`
        )
      }
    }
    if (pickupAddressParts.length >= 5) {
      // Check if pickup address exists
      const existingPickupAddress = await prisma.pickupAddress.findUnique({
        where: { sellerProfileId: updatedSellerProfile.id },
      })

      if (existingPickupAddress) {
        // Update existing pickup address
        await prisma.pickupAddress.update({
          where: { id: existingPickupAddress.id },
          data: {
            street: pickupAddressParts[0] || '',
            city: pickupAddressParts[1] || '',
            state: pickupAddressParts[2] || '',
            postalCode: pickupAddressParts[3] || '',
            country: pickupAddressParts[4] || '',
            isDefault: true,
          },
        })
      } else {
        await prisma.pickupAddress.create({
          data: {
            street: pickupAddressParts[0] || '',
            city: pickupAddressParts[1] || '',
            state: pickupAddressParts[2] || '',
            postalCode: pickupAddressParts[3] || '',
            country: pickupAddressParts[4] || '',
            isDefault: true,
            updatedAt: new Date(),
            sellerProfile: { connect: { id: updatedSellerProfile.id } },
          },
        })
      }
    }

    // Handle business address separately if provided
    if (businessAddressParts.length >= 5) {
      // Check if business address exists
      const existingBusinessAddress = await prisma.address.findUnique({
        where: { sellerProfileId: updatedSellerProfile.id },
      })

      if (existingBusinessAddress) {
        // Update existing business address
        await prisma.address.update({
          where: { id: existingBusinessAddress.id },
          data: {
            street: businessAddressParts[0] || '',
            city: businessAddressParts[1] || '',
            state: businessAddressParts[2] || '',
            postalCode: businessAddressParts[3] || '',
            country: businessAddressParts[4] || '',
            isDefault: true,
          },
        })
      } else {
        // Create new business address
        await prisma.address.create({
          data: {
            street: businessAddressParts[0] || '',
            city: businessAddressParts[1] || '',
            state: businessAddressParts[2] || '',
            postalCode: businessAddressParts[3] || '',
            country: businessAddressParts[4] || '',
            isDefault: true,
            sellerProfile: { connect: { id: updatedSellerProfile.id } },
          },
        })
      }
    }

    // Include necessary fields when fetching the updated profile
    const completeSellerProfile = await prisma.sellerProfile.findUnique({
      where: { id: updatedSellerProfile.id },
      // Add explicit select statement to ensure fields are returned
      select: {
        id: true,
        shopName: true,
        businessType: true,
        isVerified: true,
        // Add other fields you might need
      },
    })

    return NextResponse.json({
      message: 'Seller registration updated successfully',
      sellerProfile: completeSellerProfile,
    })
  } catch (error) {
    console.error('Error updating seller registration:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
