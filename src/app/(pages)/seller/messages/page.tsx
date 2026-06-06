'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Paperclip, SendHorizontal } from 'lucide-react'
import { useSellerConversations } from '@/app/hooks/useConversation'
import { useGetMessage } from '@/app/hooks/useMessage'
import { useSession } from 'next-auth/react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { io, Socket } from 'socket.io-client'
import { Message, Conversation } from '@/app/types/type'
import { sendMessage } from '@/app/services/postMessage.service'
import { PushNotificationService } from '@/app/services/pushNotificationsService'
import { AudioPlayer } from '@/app/utils/audioPlayer'

const Page: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false) // New state for mobile layout
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pushNotificationServiceRef = useRef<PushNotificationService | null>(
    null
  )

  const { data: session } = useSession()
  // Fetch conversations
  const {
    data: conversations,
    isLoading: isConversationsLoading,
    // isError: isConversationsError,
  } = useSellerConversations(session?.user.id as string)

  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  )
  // Set activeConversation once conversations are loaded
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0].id)
    }
  }, [conversations, activeConversation])

  const activeConversationData = conversations?.find(
    (conv: Conversation) => conv.id === activeConversation
  )

  const buyerFullName = activeConversationData?.buyer
    ? `${activeConversationData.buyer.firstName} ${activeConversationData.buyer.lastName}`
    : ''

  // Fetch messages for the active conversation
  const {
    data: messagesData,
    // isLoading: isMessagesLoading,
    // isError: isMessagesError,
  } = useGetMessage(activeConversation ?? '')

  // When DB loads, set them as initial state to fetch previous messages
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData)
    }
  }, [messagesData])

  useEffect(() => {
    const initPushNotifications = async () => {
      pushNotificationServiceRef.current = PushNotificationService.getInstance()
      const initialized = await pushNotificationServiceRef.current.initialize()
      if (initialized) {
        await pushNotificationServiceRef.current.requestPermission()
      }
    }

    initPushNotifications()
  }, [])

  useEffect(() => {
    console.log('Initializing socket connection')

    // Clean up previous connection if exists
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    // Create new socket connection
    socketRef.current = io('http://localhost:4000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    })

    // Cleanup only on component unmount
    return () => {
      console.log('Unmounting component, cleaning up socket')
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  // Initialize socket io on client side
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    console.log('Setting up socket event listeners')

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)

      // Join the conversation room once connected
      if (activeConversation) {
        socket.emit('join-conversation', activeConversation)
        console.log('Joining conversation:', activeConversation)
      }
    })

    socket.on('joined-conversation', (data) => {
      console.log('Successfully joined conversation:', data.conversationId)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    const handleReceiveMessage = async (message: Message) => {
      if (
        pushNotificationServiceRef.current &&
        typeof pushNotificationServiceRef.current.isDocumentVisible ===
          'function' &&
        !pushNotificationServiceRef.current.isDocumentVisible()
      ) {
        try {
          await pushNotificationServiceRef.current.showNotification({
            title: `New message from ${buyerFullName}`,
            body: message.content || 'New message',
            icon:
              activeConversationData?.buyer?.profilePicture ||
              '/default-user-img.jpg',
            data: {
              conversationId: message.conversationId,
              messageId: message.id,
              type: 'message',
            },
            sound: '/sounds/notification-general.mp3',
          })
        } catch (error) {
          console.error('Error showing notification:', error)
        }
      } else {
        AudioPlayer.getInstance().play('/sounds/notification-general.mp3')
      }

      // Update messages, avoiding duplicates
      setMessages((prevMessages) => {
        if (prevMessages.some((m) => m.id === message.id)) {
          return prevMessages
        }
        return [...prevMessages, message]
      })
    }

    socket.on('receive-message', handleReceiveMessage)
    socket.on('message-received', (data) => {
      console.log('Message received confirmation:', data)
    })

    // Remove only event listeners in cleanup, don't disconnect socket
    return () => {
      console.log('Removing socket event listeners')
      socket.off('connect')
      socket.off('joined-conversation')
      socket.off('connect_error')
      socket.off('disconnect')
      socket.off('receive-message', handleReceiveMessage)
      socket.off('message-received')
    }
  }, [activeConversation, activeConversationData, buyerFullName])

  useEffect(() => {
    if (socketRef.current?.connected && activeConversation) {
      console.log('Joining conversation:', activeConversation)
      socketRef.current.emit('join-conversation', activeConversation)
    }
  }, [activeConversation, activeConversationData]) // Only reconnect when active conversation changes

  // Scroll to bottom when there is new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (message.trim()) {
      const currentTime = new Date()
      const formattedTime = currentTime.toLocaleDateString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      const newMessage: Message = {
        id: `new-${Date.now()}`,
        content: message,
        sender: {
          id: session?.user?.id || '',
          role: 'SELLER',
        },
        sentAt: formattedTime,
        conversationId: activeConversationData.id,
        senderId: session?.user?.id || '',
      }

      // send message to DB

      // Add message to local state
      setMessages((prevMessages) => [...prevMessages, newMessage])
      sendMessage(activeConversationData.id, message)

      // Send message via socket
      if (socketRef.current?.connected) {
        socketRef.current.emit('send-message', {
          conversationId: activeConversation,
          message: newMessage,
        })
      } else {
        console.error('Socket not connected, message not sent')
      }

      setMessage('')
    }
  }
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleLastMsg = (msgs: Message) => {
    if (!msgs || !msgs.sender) {
      return ''
    }
    if (msgs.sender.role === 'SELLER') {
      return `You: ${msgs.content}`
    }
    return msgs.content
  }

  if (isConversationsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 mb-4 border-4 rounded-full border-green border-t-transparent animate-spin"></div>
          <span className="text-lg text-gray-600">
            Loading conversations...
          </span>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div className="flex flex-col bg-gray-100 lg:flex-row h-fit md:h-screen">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {!isChatOpen ? (
            <div className="w-full overflow-y-auto bg-white border-r border-gray-200">
              {conversations?.map((conversation: Conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 m-2 border-b border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer ${activeConversation === conversation.id ? 'bg-green text-white hover:bg-green-900' : ''}`}
                  onClick={() => {
                    setActiveConversation(conversation.id)
                    setIsChatOpen(true)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      {conversation.buyer?.firstName}
                    </h3>
                    {conversation.hasUnread && (
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    )}
                  </div>
                  <p
                    className={`text-xs ${activeConversation === conversation.id ? 'text-white' : 'text-gray-500 '}`}
                  >
                    {conversation.product?.name}
                  </p>
                  <p
                    className={`text-xs ${activeConversation === conversation.id ? 'text-white' : 'text-gray-500 '}`}
                  >
                    {conversation.messages?.[0]
                      ? handleLastMsg(conversation.messages?.[0])
                      : 'No messages yet'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
                <div className="flex items-center">
                  <button
                    className="mr-4 font-medium text-green"
                    onClick={() => setIsChatOpen(false)}
                  >
                    <ArrowLeft />
                  </button>
                  <div className="flex flex-col -space-y-1">
                    <h2 className="text-lg font-medium">{buyerFullName}</h2>
                    <span className="text-sm text-gray-500">
                      {activeConversationData.product.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-white">
                {messages?.map((msg: Message) => (
                  <div
                    key={msg.id}
                    className={`flex mb-4 ${
                      msg.sender.role === 'SELLER'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    {msg.sender.role === 'BUYER' && (
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2 overflow-hidden border rounded-full">
                        <Image
                          src={activeConversationData.buyer.profilePicture}
                          alt="Buyer profile picture"
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] ${msg.sender.role === 'SELLER' ? '' : 'ml-1'}`}
                    >
                      <div
                        className={`${
                          msg.sender.role === 'SELLER'
                            ? 'bg-green text-white rounded-tl-lg rounded-bl-lg rounded-tr-lg'
                            : 'bg-gray-100 rounded-tr-lg rounded-br-lg rounded-tl-lg'
                        } p-3 break-words`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p
                        className={`text-xs text-gray-500 mt-1 ${
                          msg.sender.role === 'SELLER'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {msg.sentAt}
                      </p>
                    </div>
                  </div>
                ))}
                {/* This div ensures scrolling to the bottom */}
                <div ref={messagesEndRef}></div>
              </div>
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    className="px-4 py-2 ml-2 text-white rounded-full bg-green hover:bg-green-900"
                    onClick={handleSendMessage}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="flex-1 hidden lg:flex lg:flex-row">
          {/* Left Side Bar */}
          <div className="w-64 overflow-y-auto bg-white border-r border-gray-200">
            {conversations?.map((conversation: Conversation) => (
              <div
                key={conversation.id}
                className={`p-4 m-2 border-b border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer ${activeConversation === conversation.id ? 'bg-green text-white hover:bg-green-900' : ''}`}
                onClick={() => setActiveConversation(conversation.id)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    {conversation.buyer?.firstName}
                  </h3>
                  {conversation.hasUnread && (
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  )}
                </div>
                <p
                  className={`text-xs ${activeConversation === conversation.id ? 'text-white' : 'text-gray-500 '}`}
                >
                  {conversation.product?.name}
                </p>
                <p
                  className={`text-xs mt-1 ${activeConversation === conversation.id ? 'text-white' : 'text-gray-500 '}`}
                >
                  {conversation.messages?.[0]
                    ? handleLastMsg(conversation.messages?.[0])
                    : 'No messages yet'}
                </p>
              </div>
            ))}
          </div>
          {/* Middle Area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-4 bg-white border-b border-gray-200">
              <h2 className="text-lg font-medium">{buyerFullName}</h2>
              <p className="text-sm text-gray-500">
                {activeConversationData?.product?.name}
              </p>
            </div>
            {/* Chat Field */}
            <div className="flex-1 p-6 overflow-y-auto bg-white">
              {messages?.map((msg: Message) => (
                <div
                  key={msg.id}
                  className={`flex items-center mb-4 ${msg.sender.role === 'SELLER' ? 'justify-end' : ''} ${msg.sender.role === 'BUYER' ? 'justify-start' : ''}`}
                >
                  {msg.sender.role === 'BUYER' && (
                    <div className="items-center justify-center flex-shrink-0 w-10 h-10 mr-3 border rounded-full">
                      <Image
                        src={activeConversationData.buyer.profilePicture}
                        alt={`Sellers profile picture`}
                        width={100}
                        height={100}
                        className="object-contain w-full h-full"
                      ></Image>
                    </div>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <div>
                        <div
                          className={`${msg.sender.role === 'SELLER' ? 'bg-green text-white' : 'bg-gray-100'} rounded-lg p-3 max-w-md`}
                        >
                          <TooltipTrigger>
                            <p className="text-sm text-left">{msg.content}</p>
                          </TooltipTrigger>
                        </div>
                        <TooltipContent>
                          <p
                            className={`text-xs text-white ${msg.sender.role === 'BUYER' ? 'text-right' : ''}`}
                          >
                            {msg.sentAt}
                          </p>
                        </TooltipContent>
                      </div>
                    </Tooltip>
                  </TooltipProvider>
                  {msg.sender.role === 'SELLER' && (
                    <div className="items-center justify-center flex-shrink-0 w-10 h-10 ml-3 border rounded-full">
                      <Image
                        src={activeConversationData.seller.profilePicture}
                        alt={`Buyers profile picture`}
                        width={100}
                        height={100}
                        className="object-contain w-full h-full"
                      ></Image>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Chat Inputs */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center">
                <button className="p-2 mr-3 bg-transparent hover:bg-transparent">
                  <Paperclip size={20} className="text-green" />
                </button>
                <textarea
                  ref={textareaRef}
                  placeholder="Type a message..."
                  className={`flex-1 min-h-[40px] max-h-[120px] w-full border border-gray-300 px-4 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-green ${textareaRef.current && textareaRef.current.value && textareaRef.current.value.length > 150 ? 'rounded-lg overflow-auto' : 'rounded-full overflow-hidden'}`}
                  value={message}
                  onChange={handleTextAreaChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  rows={1}
                  style={{
                    lineHeight: '1.5',
                    maxHeight: '150px',
                    minHeight: '40px',
                    transition: 'height 0.2s ease',
                  }}
                />
                <button
                  className="ml-3 rounded-full cursor-pointer text-green"
                  onClick={handleSendMessage}
                >
                  <SendHorizontal className="mx-2 my-3" />
                </button>
              </div>
            </div>
          </div>
          {/* Right Side Bar */}
          <div className="hidden max-h-full lg:block bg-green">
            <div className="w-64 m-4 overflow-y-auto bg-white border-l border-gray-200 rounded-xl">
              <div className="p-4 flex flex-col items-center justify-between h-[calc(100vh-32px)]">
                <div className="relative flex items-center justify-center mb-2 bg-gray-200 rounded-full h-14 w-14">
                  <Image
                    src={
                      activeConversationData?.buyer?.profilePicture ||
                      '/deals-mock4.png'
                    }
                    alt="Store logo"
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                </div>
                <h3 className="text-lg font-bold">{buyerFullName}</h3>
                {/* <Link href="#" className="text-sm text-green hover:underline">
                  View Profile
                </Link> */}
                <div className="w-full mt-6 space-y-4">
                  <div className="flex items-center w-full">
                    <span className="w-full text-xs text-center">
                      Joined: {activeConversationData?.buyer.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center"></div>
                </div>
                <div className="p-4 mt-auto">
                  <Button className="flex justify-center text-sm text-orange hover:underline">
                    Report User
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
