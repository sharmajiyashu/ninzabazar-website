import NextAuth from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { syncAuthUrl } from '@/lib/app-url'
import type { NextRequest } from 'next/server'

const nextAuthHandler = NextAuth(authOptions)

type AuthRouteContext = { params: Promise<{ nextauth: string[] }> }

async function handler(req: NextRequest, context: AuthRouteContext) {
  syncAuthUrl(req)
  return nextAuthHandler(req, context)
}

export { handler as GET, handler as POST }
