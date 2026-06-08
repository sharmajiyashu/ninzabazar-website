'use client'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  BadgeCheck,
  BadgeMinus,
  MailQuestion,
  Paperclip,
  SendHorizontal,
} from 'lucide-react'
import { useBuyerConversations } from '@/app/hooks/useConversation'
import { useGetMessage } from '@/app/hooks/useMessage'
import { useSession } from 'next-auth/react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import { Message, Conversation } from '@/app/types/type'
import { sendMessage } from '@/app/services/postMessage.service'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { PushNotificationService } from '@/app/services/pushNotificationsService'
import { AudioPlayer } from '@/app/utils/audioPlayer'

interface TempChatData {
  tempSellerId: string
  tempProductId: string
  tempfirstName: string
  tempProductName: string
  tempCompanyName: string
}

const MessagesContent: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false) // New state for mobile layout
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTempChat, setIsTempChat] = useState<boolean>(false)
  const [tempChatData, setTempChatData] = useState<TempChatData | null>(null)
  const pushNotificationServiceRef = useRef<PushNotificationService | null>(
    null
  )

  const search = useSearchParams()
  const tempSellerId = search.get('sellerId')
  const tempProductId = search.get('productId')
  const tempfirstName = search.get('firstName')
  const tempProductName = search.get('productName')
  const tempCompanyName = search.get('companyName')
  const existingConvId = search.get('xcnv')

  const { data: session } = useSession()

  const userFullName = session?.user?.name || 'User'
  const userFirstName = userFullName.split(' ')[0]
  // Fetch conversations
  const {
    data: conversations,
    isLoading: isConversationsLoading,
    refetch: refetchConversations,
  } = useBuyerConversations(session?.user.id as string)

  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  )
  // LEFT AT : CREATE A UI FOR NULL ACTIVE CONVERSATION, DONT DISPLAY THE MIDDLE AREA ON DESKTOP FOR BETTER UI/UX
  const activeConversationData = conversations?.find(
    (conv: Conversation) =>
      conv.id === activeConversation || conv.id === existingConvId
  )

  const sellerProfile = activeConversationData?.seller?.sellerProfile
  const sellerDisplayName =
    tempCompanyName && !sellerProfile
      ? `New chat: ${tempCompanyName}`
      : sellerProfile?.shopName ||
        sellerProfile?.companyName ||
        sellerProfile?.businessRegisteredName ||
        tempCompanyName ||
        'Seller'
  const sellerProfilePicture =
    activeConversationData?.seller?.profilePicture || '/default-user-img.jpg'
  const sellerStoreId = sellerProfile?.id
  const buyerProfilePicture =
    activeConversationData?.buyer?.profilePicture || '/default-user-img.jpg'
  useEffect(() => {
    if (existingConvId) {
      setActiveConversation(existingConvId)
      setIsChatOpen(true) // auto open for mobile layout
    }
  }, [existingConvId])

  // Fetch messages for the active conversation
  const {
    data: messagesData,
    // isLoading: isMessagesLoading,
    // isError: isMessagesError,
  } = useGetMessage(activeConversation ?? '')

  // if existing cnv id is provided from search params then get messages

  // When DB loads, set them as initial state to fetch previous messages
  useEffect(() => {
    if (messagesData && !isTempChat) {
      setMessages(messagesData)
    }
  }, [messagesData, isTempChat])

  const senderName = sellerDisplayName

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

  // Initialize socket io on client side
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
            title: `New message from ${senderName}`,
            body: message.content || 'New message',
            icon:
              activeConversationData?.seller?.profilePicture ||
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
  }, [activeConversation, activeConversationData, senderName]) // Only reconnect when active conversation changes

  useEffect(() => {
    if (socketRef.current?.connected && activeConversation) {
      console.log('Joining conversation:', activeConversation)
      socketRef.current.emit('join-conversation', activeConversation)
    }
  }, [activeConversation])

  // Scroll to bottom when there is new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData)
      // Scroll to bottom after messages are loaded
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100) // Small delay to ensure DOM is updated
    }
  }, [messagesData])

  //useEffect specifically for scrolling when activeConversation changes:
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [activeConversation, messages.length])

  // check if there is temp chat data from URL params on mount
  useEffect(() => {
    if (tempSellerId && tempProductId && tempProductName && tempCompanyName) {
      setIsTempChat(true)
      setTempChatData({
        tempSellerId,
        tempProductId,
        tempCompanyName,
        tempfirstName: userFirstName,
        tempProductName,
      })
      setIsChatOpen(true) // auto open for mobile layout
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tempSellerId,
    tempProductId,
    tempfirstName,
    tempProductName,
    userFirstName,
  ])

  // Clear URL params and reset state only when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear URL parameters when navigating away
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        if (url.searchParams.has('sellerId')) {
          url.searchParams.delete('sellerId')
          url.searchParams.delete('productId')
          url.searchParams.delete('companyName')
          url.searchParams.delete('productName')
          window.history.replaceState({}, '', url.toString())
        }
      }

      // Reset state
      setIsChatOpen(false)
      setIsTempChat(false)
      setTempChatData(null)
      setMessages([])
    }

    // Listen for browser navigation (back/forward, refresh, close tab)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // For Next.js App Router navigation - you can also listen to popstate
    const handlePopState = () => {
      handleBeforeUnload()
    }
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const handleBeforeUnload = () => {
    // Clear URL parameters when navigating away
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('sellerId')) {
        url.searchParams.delete('sellerId')
        url.searchParams.delete('productId')
        url.searchParams.delete('companyName')
        url.searchParams.delete('productName')
        window.history.replaceState({}, '', url.toString())
      }
    }

    // Reset state
    setIsChatOpen(false)
    setIsTempChat(false)
    setTempChatData(null)
    setMessages([])
  }

  const createConversation = async (
    sellerId: string,
    productId: string,
    initialMessage: string
  ) => {
    try {
      const res = await axios.post('/api/conversations/post', {
        sellerId,
        productId,
        buyerId: session?.user?.id,
        initialMessage,
      })
      return res.data
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }
  const handleSendMessage = async () => {
    if (!message.trim()) return

    const currentTime = new Date()
    const formattedTime = currentTime.toLocaleDateString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

    const newMessage: Message = {
      id: `${isTempChat ? 'temp-' : 'new-'}${Date.now()}`,
      content: message,
      sender: {
        id: session?.user?.id || '',
        role: 'BUYER',
      },
      sentAt: formattedTime,
      conversationId: isTempChat ? 'temp' : activeConversationData?.id || '',
      senderId: session?.user?.id || '',
    }

    // Add message to local state immediately for UI feedback
    setMessages((prevMessages) => [...prevMessages, newMessage])

    if (isTempChat && tempChatData) {
      try {
        // Create the conversation with the initial message
        const newConversation = await createConversation(
          tempChatData.tempSellerId,
          tempChatData.tempProductId,
          message
        )

        // Switch from temporary to real conversation
        setIsTempChat(false)
        setActiveConversation(newConversation.id)
        setTempChatData(null)

        // Refetch conversations to get the new one
        refetchConversations()

        // Clear the URL params (optional)
        const url = new URL(window.location.href)
        url.searchParams.delete('sellerId')
        url.searchParams.delete('productId')
        url.searchParams.delete('companyName')
        url.searchParams.delete('productName')
        window.history.replaceState({}, '', url.toString())
      } catch (error) {
        console.error('Failed to create conversation:', error)
        // Remove the message from UI if creation failed
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== newMessage.id)
        )
        return
      }
    } else {
      // Existing conversation logic
      if (activeConversationData) {
        sendMessage(activeConversationData.id, message)

        if (socketRef.current?.connected) {
          socketRef.current.emit('send-message', {
            conversationId: activeConversation,
            message: newMessage,
          })
        }
      }
    }

    setMessage('')
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
    if (msgs.sender.role === 'BUYER') {
      return `You: ${msgs.content}`
    }
    return msgs.content
  }

  const handleConversationSelect = (conversationId: string) => {
    if (isTempChat) {
      handleBeforeUnload()
    }
    setActiveConversation(conversationId)
    setIsChatOpen(true)
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
              <h1 className="p-4 text-2xl font-bold text-green">Messages</h1>

              {/* tempchat data */}
              {isTempChat && tempChatData && (
                <div
                  className="p-4 m-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 rounded-xl bg-blue-50 "
                  onClick={() => setIsChatOpen(true)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-blue-600">
                      New Chat: {tempChatData.tempCompanyName}
                    </h3>
                    <span className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded">
                      New
                    </span>
                  </div>

                  <p className="text-xs text-blue-500">
                    Start a conversation...
                  </p>
                </div>
              )}
              {/* existing convos */}
              {conversations?.map((conversation: Conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 m-2 border-b border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer shadow-sm ${activeConversation === conversation.id ? 'bg-green text-white hover:bg-green-900' : ''}`}
                  onClick={() => {
                    handleConversationSelect(conversation.id)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      {conversation.seller?.sellerProfile.shopName ||
                        conversation.seller?.sellerProfile.companyName ||
                        conversation.seller?.sellerProfile
                          .businessRegisteredName}
                    </h3>

                    {conversation.hasUnread && (
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    )}
                  </div>

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
                <button
                  className="mr-4 font-medium text-green"
                  onClick={() => setIsChatOpen(false)}
                >
                  <ArrowLeft />
                </button>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-lg font-medium truncate">
                      {sellerDisplayName}
                    </h2>
                    {sellerStoreId && (
                      <Link href={`/store/${sellerStoreId}`}>
                        <Button className="text-sm text-green bg-white border hover:text-white hover:bg-green ml-4 flex-shrink-0">
                          View Store
                        </Button>
                      </Link>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 truncate">
                    {tempProductName && `${tempProductName}`}
                  </span>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-white">
                {messages?.map((msg: Message) => (
                  <div
                    key={msg.id}
                    className={`flex mb-4 ${
                      msg.sender.role === 'BUYER'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    {msg.sender.role === 'SELLER' && (
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2 overflow-hidden border rounded-full">
                        <Image
                          src={sellerProfilePicture}
                          alt="Seller profile picture"
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] ${msg.sender.role === 'BUYER' ? '' : 'ml-1'}`}
                    >
                      <div
                        className={`${
                          msg.sender.role === 'BUYER'
                            ? 'bg-green text-white rounded-tl-lg rounded-bl-lg rounded-tr-lg'
                            : 'bg-gray-100 rounded-tr-lg rounded-br-lg rounded-tl-lg'
                        } p-3 break-words`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p
                        className={`text-xs text-gray-500 mt-1 ${
                          msg.sender.role === 'BUYER'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {msg.sentAt}
                      </p>
                    </div>
                  </div>
                ))}
                {tempChatData && (
                  <div className="flex items-center justify-center h-screen">
                    <span>No messages yet</span>
                  </div>
                )}
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
            {/* temp conv box */}
            {isTempChat && tempChatData && (
              <div
                className="p-4 m-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 rounded-xl bg-blue-50 "
                onClick={() => setIsChatOpen(true)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-blue-600">
                    New Chat: {tempChatData.tempCompanyName}
                  </h3>
                  <span className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded">
                    New
                  </span>
                </div>
                <p className="text-xs text-blue-500">
                  {tempChatData.tempProductName}
                </p>
                <p className="text-xs text-blue-500">Start a conversation...</p>
              </div>
            )}
            {/* existing convs */}
            {conversations?.map((conversation: Conversation) => (
              <div
                key={conversation.id}
                className={`p-4 m-2 border-b border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer ${activeConversation === conversation.id ? 'bg-green text-white hover:bg-green-900' : ''}`}
                onClick={() => handleConversationSelect(conversation.id)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    {conversation.seller?.sellerProfile.shopName ||
                      conversation.seller?.sellerProfile.companyName ||
                      conversation.seller?.sellerProfile.businessRegisteredName}
                  </h3>
                  {conversation.hasUnread && (
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  )}
                </div>

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
            {!activeConversation && !isTempChat ? (
              <div className="flex items-center justify-center flex-1 h-full bg-gray-50">
                <div className="flex flex-col items-center text-center">
                  <MailQuestion size={100} className="text-gray-700" />
                  <h2 className="mb-2 text-2xl font-semibold text-gray-700">
                    No Conversation Selected
                  </h2>
                  <p className="mb-4 text-gray-500">
                    Select a conversation from the left to start chatting.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 bg-white border-b border-gray-200">
                  <h2 className="text-lg font-medium">{sellerDisplayName}</h2>
                </div>
                {/* Chat Field */}
                <div className="flex-1 p-6 overflow-y-auto bg-white">
                  {messages?.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={`flex items-center mb-4 ${msg.sender.role === 'BUYER' ? 'justify-end' : ''} ${msg.sender.role === 'SELLER' ? 'justify-start' : ''}`}
                    >
                      {msg.sender.role === 'SELLER' && (
                        <div className="items-center justify-center flex-shrink-0 w-10 h-10 mr-3 border rounded-full">
                          <Image
                            src={sellerProfilePicture}
                            alt={`Buyers profile picture`}
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
                              className={`${msg.sender.role === 'BUYER' ? 'bg-green text-white' : 'bg-gray-100'} rounded-lg p-3 max-w-md`}
                            >
                              <TooltipTrigger>
                                <p className="text-sm text-left">
                                  {msg.content}
                                </p>
                              </TooltipTrigger>
                            </div>
                            <TooltipContent>
                              <p className={`text-xs text-white`}>
                                {msg.sentAt}
                              </p>
                            </TooltipContent>
                          </div>
                        </Tooltip>
                      </TooltipProvider>
                      {msg.sender.role === 'BUYER' && (
                        <div className="items-center justify-center flex-shrink-0 w-10 h-10 ml-3 border rounded-full">
                          <Image
                            src={buyerProfilePicture}
                            alt={`Buyer profile picture`}
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
              </>
            )}
          </div>
          {/* Right Side Bar */}
          <div className="hidden max-h-full lg:block bg-green">
            <div className="w-64 m-4 overflow-y-auto bg-white border-l border-gray-200 rounded-xl">
              {!activeConversation && !isTempChat ? (
                <div className="flex flex-col text-center items-center justify-center h-[calc(100vh-32px)] p-8">
                  <MailQuestion size={64} className="mb-4 text-green" />
                </div>
              ) : (
                <div className="p-4 flex flex-col items-center justify-between h-[calc(100vh-32px)]">
                  <div className="relative flex items-center justify-center mb-2 bg-gray-200 rounded-full h-14 w-14">
                    <Image
                      src={
                        activeConversationData?.seller?.profilePicture ||
                        '/deals-mock4.png'
                      }
                      alt="Store logo"
                      width={56}
                      height={56}
                      className="rounded-full"
                    />
                  </div>
                  <h3 className="text-lg font-bold">{sellerDisplayName}</h3>
                  {sellerStoreId && (
                    <Link
                      href={`/store/${sellerStoreId}`}
                      className="text-sm text-green hover:underline"
                    >
                      View Shop
                    </Link>
                  )}
                  <div className="w-full mt-6 space-y-4">
                    <div className="flex items-center">
                      <span className="text-xs font-medium">
                        {sellerProfile?.isVerified ? (
                          <div className="flex items-center gap-x-1">
                            <BadgeCheck className="w-5 h-5 text-white fill-green" />
                            Verified Seller
                          </div>
                        ) : (
                          <div className="flex items-center gap-x-2">
                            <BadgeMinus className="w-5 h-5 text-disabledgrey" />{' '}
                            Not Verified
                          </div>
                        )}
                      </span>
                      <span className="ml-auto text-xs">
                        Joined:{' '}
                        {sellerProfile?.createdAt
                          ? new Date(sellerProfile.createdAt).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-4 h-4 mr-2 text-xs">
                        📦
                      </div>
                      <span className="text-xs">
                        Products: {sellerProfile?.products?.length ?? 0}
                      </span>
                      <span className="ml-auto text-xs">
                        Rating:{' '}
                        {sellerProfile?.storeRatingSummary?.average ?? '—'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 mt-auto">
                    <a
                      href="#"
                      className="flex justify-center text-sm text-orange hover:underline"
                    >
                      Report Shop
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
const LoadingMessages = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 mb-4 border-4 rounded-full border-green border-t-transparent animate-spin"></div>
      <span className="text-lg text-gray-600">Loading messages...</span>
    </div>
  </div>
)

// Main component with Suspense wrapper
const Page: React.FC = () => {
  return (
    <Suspense fallback={<LoadingMessages />}>
      <MessagesContent />
    </Suspense>
  )
}

export default Page
