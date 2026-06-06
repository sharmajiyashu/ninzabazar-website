import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
  }
  try {
    const session = await getServerSession(authOptions)
    const { conversationId, content } = await req.json()

    if (!conversationId || !content) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!session?.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: user id missing' },
        { status: 401 }
      )
    }

    const postMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: session?.user?.id,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    })
    return NextResponse.json(postMessage)
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
