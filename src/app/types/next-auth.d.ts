import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      emailVerified?: boolean
    }
  }

  interface User {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    email?: string
    name?: string
    role?: string
    picture?: string
    emailVerified?: boolean
    buyerProfile?: {
      emailVerified?: boolean
    }
  }
}
