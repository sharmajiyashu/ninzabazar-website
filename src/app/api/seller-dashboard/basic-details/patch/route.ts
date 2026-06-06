import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  try {
    const updateData = await req.json()
    const { id, ...fieldsToUpdate } = updateData

    // Validate required ID
    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    const mappedData: any = {} // eslint-disable-line

    // Map seller profile fields
    if (fieldsToUpdate.businessRegisteredName) {
      mappedData.businessRegisteredName = fieldsToUpdate.businessRegisteredName
    }
    if (fieldsToUpdate.company_name) {
      mappedData.companyName = fieldsToUpdate.company_name
    }

    if (fieldsToUpdate.individual_registered_name) {
      mappedData.individualRegisteredName =
        fieldsToUpdate.individual_registered_name
    }

    if (fieldsToUpdate.shop_description) {
      mappedData.description = fieldsToUpdate.shop_description
    }

    if (fieldsToUpdate.business_category) {
      mappedData.businessType = fieldsToUpdate.business_category
    }

    let addressUpdated = false

    // Handle individual address fields
    const addressFields = ['street', 'city', 'state', 'postalCode', 'country']
    const addressData: any = {} //eslint-disable-line
    let hasAddressUpdate = false

    // Check if any address fields are being updated
    addressFields.forEach((field) => {
      if (fieldsToUpdate[field] !== undefined) {
        addressData[field] = fieldsToUpdate[field]
        hasAddressUpdate = true
      }
    })

    if (hasAddressUpdate) {
      try {
        // Check if address record exists first
        const existingAddress = await prisma.address.findUnique({
          where: {
            sellerProfileId: id,
          },
        })
        console.log('Existing address:', existingAddress)

        if (existingAddress) {
          // Update existing address using the address ID
          await prisma.address.update({
            where: {
              id: existingAddress.id, // Use the address record's ID
            },
            data: addressData,
          })
          addressUpdated = true
          console.log('Address updated successfully')
        } else {
          // Create new address if none exists
          await prisma.address.create({
            data: {
              ...addressData,
              sellerProfileId: id,
            },
          })
          addressUpdated = true
          console.log('New address created successfully')
        }
      } catch (addressError) {
        console.error('Error updating address:', addressError)
        // Continue with other updates even if address fails
      }
    }

    let sellerProfileUpdated = false

    // Update seller profile if there are mapped fields
    if (Object.keys(mappedData).length > 0) {
      try {
        await prisma.sellerProfile.update({
          where: { id },
          data: mappedData,
        })
        sellerProfileUpdated = true
        console.log('Seller profile updated successfully')
      } catch (profileError) {
        console.error('Error updating seller profile:', profileError)
        throw profileError // Re-throw since this is critical
      }
    }

    // Return success response
    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        updated: {
          sellerProfile: sellerProfileUpdated,
          address: addressUpdated,
          profileFields: Object.keys(mappedData),
          addressFields: Object.keys(addressData),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      'PATCH /api/seller-dashboard/basic-details/patch error:',
      error
    )

    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: 'Failed to update profile',
          error: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
