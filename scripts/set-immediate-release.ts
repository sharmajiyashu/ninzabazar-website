import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function setImmediateRelease(orderId: string) {
  try {
    // Set release date to 5 minutes ago for immediate release
    const pastReleaseDate = new Date()
    pastReleaseDate.setMinutes(pastReleaseDate.getMinutes() - 5)

    const updatedPayment = await prisma.escrowPayment.update({
      where: { orderId },
      data: {
        releaseDate: pastReleaseDate,
      },
    })

    console.log('Updated escrow payment:', updatedPayment)
    console.log('Payment will be released on next cron run')
  } catch (error) {
    console.error('Error updating release date:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get order ID from command line
const orderId = process.argv[2]
if (!orderId) {
  console.error('Please provide an order ID')
  process.exit(1)
}

setImmediateRelease(orderId)
