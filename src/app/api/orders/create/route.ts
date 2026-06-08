import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { ORDER_STATUSES } from '@/lib/order-status'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      userId,
      items,
      shippingMethods,
      totalAmount,
      paymentId,
      orderId,
      shippingAddress,
    } = await request.json()

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile || buyerProfile.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userId or items' },
        { status: 400 }
      )
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 })
    }

    let addressId: string | null = null
    if (shippingAddress?.id) {
      addressId = shippingAddress.id
    } else if (shippingAddress) {
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
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItemsData = items.map((item: any, index: number) => {
      const itemShippingMethod = shippingMethods?.[item.id]

      let priceAtPurchase = 0

      if (item.priceAtPurchase != null) {
        const itemPrice =
          typeof item.priceAtPurchase === 'string'
            ? parseFloat(item.priceAtPurchase)
            : Number(item.priceAtPurchase)
        if (!isNaN(itemPrice) && itemPrice > 0) priceAtPurchase = itemPrice
      }

      if (priceAtPurchase <= 0) {
        throw new Error(
          `Invalid price for item at index ${index}: ${JSON.stringify(item)}`
        )
      }

      const variantCombination: string[] = Array.isArray(item.variantCombination)
        ? item.variantCombination
        : []

      return {
        sellerId: item.sellerId || null,
        quantity: item.quantity || 1,
        priceAtPurchase,
        productId: item.productId || item.id,
        productName: item.productName || item.name || 'Unknown Product',
        variantId: item.variantId || null,
        variantCombination,
        shippingMethodName:
          item.shippingMethodName || itemShippingMethod?.name || null,
        shippingMethodPrice:
          item.shippingMethodPrice ?? itemShippingMethod?.price ?? 0,
      }
    })

    const firstItemSellerId = orderItemsData[0]?.sellerId
    if (!firstItemSellerId) {
      return NextResponse.json(
        { error: 'Seller information not found in order items' },
        { status: 400 }
      )
    }

    const createOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerId: userId,
          totalAmount: parseFloat(totalAmount.toString()),
          paymentId: paymentId || null,
          razorpayOrderId: orderId || null,
          status: ORDER_STATUSES.PROCESSING,
          orderItems: { create: orderItemsData },
          ...(addressId && { shippingAddressId: addressId }),
        },
        include: {
          orderItems: {
            include: {
              product: { select: { id: true, name: true, images: true } },
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

      for (const item of orderItemsData) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { inventory: true },
        })
        if (product && product.inventory >= item.quantity) {
          await tx.product.update({
            where: { id: item.productId },
            data: { inventory: { decrement: item.quantity } },
          })
        }
      }

      const releaseDate = new Date()
      releaseDate.setDate(releaseDate.getDate() + 14)

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

      return { order, escrowPayment }
    })

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
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}
