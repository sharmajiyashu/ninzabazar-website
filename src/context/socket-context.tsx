import React, { createContext, useContext, useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface SocketContextProps {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => useContext(SocketContext)
const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user) return

    // Create Socket.IO client
    const socketInstance = io({
      path: '/api/socket',
    })

    // Set event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    setSocket(socketInstance)

    // Cleanup function
    return () => {
      socketInstance.disconnect()
    }
  }, [session])
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider
