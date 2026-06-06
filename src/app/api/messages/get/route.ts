import { messageService } from '@/app/services/messages.service'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
  }
  try {
    const conversationId = req.headers.get('conversationId') // get the conversations id passed from the client

    if (!conversationId) {
      return NextResponse.json(
        { message: 'Conversation ID is required' },
        { status: 400 }
      )
    }
    const messages = await messageService.getMessages(conversationId as string)
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ message: 'Internal server error' })
  }
}
