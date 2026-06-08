import express from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.on('connect_error', (err) => {
  // the reason of the error, for example "xhr poll error"
  console.log(err.message)

  // some additional description, for example the status code of the initial HTTP response
  console.log(err.description)

  // some additional context, for example the XMLHttpRequest object
  console.log(err.context)
})

io.on('connection', (socket: Socket) => {
  console.log(`User Connected: ${socket.id}`)

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId)
  })

  socket.on('send-message', (data) => {
    console.log(
      `Message received from ${socket.id} in conversation ${data.conversationId}:`,
      data.message
    )
    // Emit to all clients in the room except the sender
    io.to(data.conversationId).emit('receive-message', data.message)
  })

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`)
  })

  // Handle any socket errors
  socket.on('error', (error) => {
    console.error(`Socket ${socket.id} error:`, error)
  })
})

// Handle server-level errors
io.engine.on('connection_error', (err) => {
  console.log('Server connection error:', err.req) // the request object
  console.log('Server connection error code:', err.code) // the error code, for example 1
  console.log('Server connection error message:', err.message) // the error message, for example "Session ID unknown"
  console.log('Server connection error context:', err.context) // some additional error context
})
const port = 4000
server.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`)
})
