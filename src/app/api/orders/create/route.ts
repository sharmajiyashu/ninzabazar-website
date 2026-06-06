import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const {
      userId,
      items,
      shippingMethods,
      totalAmount,
      paymentId,
      orderId,
      shippingAddress,
    } = await request.json()

    console.log('Order creation request:', {
      userId,
      items: items?.length,
      totalAmount,
      paymentId,
      orderId,
      shippingAddress,
    })

    // Validate required fields
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userId or items' },
        { status: 400 }
      )
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid total amount' },
        { status: 400 }
      )
    }

    // Handle shipping address creation/connection
    let addressId = null
    if (shippingAddress && shippingAddress.id) {
      // If address has an ID, use existing address
      addressId = shippingAddress.id
    } else if (shippingAddress) {
      // Create new address if data is provided but no ID
      try {
        const createdAddress = await prisma.address.create({
          data: {
            street: shippingAddress.street || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postalCode: shippingAddress.postalCode || '',
            country: shippingAddress.country || '',
            isDefault: shippingAddress.isDefault || false,
            buyerProfileId: userId,
          },
        })
        addressId = createdAddress.id
      } catch (addressError) {
        console.error('Error creating shipping address:', addressError)
        // Continue without address if creation fails
      }
    }

    // Prepare order items data
    // eslint-disable-next-line
    const orderItemsData = items.map((item: any, index: number) => {
      // Get shipping method for this item
      const itemShippingMethod = shippingMethods?.[item.id]

      let priceAtPurchase = 0

      // if sale price is available and valid, use it
      if (item.isSale && item.salePrice != null) {
        const salePrice =
          typeof item.salePrice === 'string'
            ? parseFloat(item.salePrice)
            : Number(item.salePrice)

        if (!isNaN(salePrice) && salePrice > 0) {
          priceAtPurchase = salePrice
        } else {
          console.error(`Invalid sale price for item: ${index}`, item.salePrice)
        }
      }

      // Use priceAtPurchase from the item if available (from frontend calculation)
      if (item.priceAtPurchase != null) {
        const itemPrice =
          typeof item.priceAtPurchase === 'string'
            ? parseFloat(item.priceAtPurchase)
            : Number(item.priceAtPurchase)

        if (!isNaN(itemPrice) && itemPrice > 0) {
          priceAtPurchase = itemPrice
        }
      }

      // Validate final price
      if (priceAtPurchase <= 0) {
        throw new Error(
          `Invalid price for item at index ${index}: ${JSON.stringify(item)}`
        )
      }

      // fallback to base price if sale price is not valid or not available
      if (priceAtPurchase === 0 && item.basePrice != null) {
        const basePrice =
          typeof item.basePrice === 'string'
            ? parseFloat(item.basePrice)
            : Number(item.basePrice)

        if (!isNaN(basePrice) && basePrice > 0) {
          priceAtPurchase = basePrice
        } else {
          console.error(`Invalid base price for item: ${index}`, item.basePrice)
        }
      }
      return {
        sellerId: item.sellerId || null,
        quantity: item.quantity || 1,
        priceAtPurchase: priceAtPurchase,
        productId: item.productId || item.id, // Handle both possible field names
        productName: item.name || item.productName || 'Unknown Product',
        variantId: item.variantId || null,
        shippingMethodName: itemShippingMethod?.name || null,
        shippingMethodPrice: itemShippingMethod?.price || 0,
      }
    })

    console.log('Prepared order items:', orderItemsData)

    // Find the seller ID from the first order item (assuming single seller per order)
    // For multi-seller orders, you would need to create multiple escrow payments
    const firstItemSellerId = orderItemsData[0]?.sellerId

    if (!firstItemSellerId) {
      return NextResponse.json(
        { error: 'Seller information not found in order items' },
        { status: 400 }
      )
    }

    // Create the order with transaction for data consistency
    const createOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerId: userId,
          totalAmount: parseFloat(totalAmount.toString()),
          paymentId: paymentId || null,
          razorpayOrderId: orderId || null,
          status: 'processing', // Default status for new orders
          // Create order items as nested records
          orderItems: {
            create: orderItemsData,
          },
          // Connect the shipping address if available
          ...(addressId && {
            shippingAddressId: addressId, // Direct field assignment
          }),
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
          shippingAddress: true,
          buyer: {
            select: {
              id: true,
              userId: true,
              profilePicture: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  contactNumber: true,
                },
              },
            },
          },
        },
      })

      // Calculate escrow release date (14 days from now)
      const releaseDate = new Date()
      releaseDate.setDate(releaseDate.getDate() + 14)

      // Create an escrow payment within the same transaction
      const escrowPayment = await tx.escrowPayment.create({
        data: {
          id: `escrow_${Date.now()}`,
          orderId: order.id,
          buyerId: userId,
          sellerId: firstItemSellerId,
          amount: parseFloat(totalAmount.toString()),
          razorpayPaymentId: paymentId || '',
          status: 'HELD',
          releaseDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      console.log('Created escrow payment:', escrowPayment.id)

      return {
        order,
        escrowPayment,
      }
    })

    console.log('Order created successfully:', createOrder.order.id)
    console.log('Escrow payment created:', createOrder.escrowPayment.id)

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      orderId: createOrder.order.id,
      order: createOrder.order,
      escrowPayment: {
        id: createOrder.escrowPayment.id,
        status: createOrder.escrowPayment.status,
        releaseDate: createOrder.escrowPayment.releaseDate,
      },
    })
  } catch (error) {
    console.error('Error creating order:', error)

    // Provide more specific error messages
    if (error === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate order detected' },
        { status: 409 }
      )
    }

    if (error === 'P2003') {
      return NextResponse.json(
        {
          error: 'Invalid reference data (user, product, or address not found)',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
