import { conversationService } from '@/app/services/conversations.service'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
  }
  try {
    const userId = req.headers.get('userId') // get the userid from req
    const userRole = req.headers.get('userRole') // get the user role from req
    if (!userId) {
      // check if userId is present
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }
    let conversations

    if (userRole === 'SELLER') {
      conversations = await conversationService.getSellerConversations(userId)
    } else {
      conversations = await conversationService.getBuyerConversations(userId)
    }

    return NextResponse.json(conversations)
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
