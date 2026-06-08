import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  redirectPath,
  verificationFailedPath,
  verificationSuccessPath,
} from '@/lib/routes'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(
        redirectPath(verificationFailedPath('missing_params'), request)
      )
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken || verificationToken.identifier !== email) {
      return NextResponse.redirect(
        redirectPath(verificationFailedPath('invalid_token'), request)
      )
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.redirect(
        redirectPath(verificationFailedPath('token_expired'), request)
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { buyerProfile: true },
    })

    if (!user) {
      return NextResponse.redirect(
        redirectPath(verificationFailedPath('user_not_found'), request)
      )
    }

    await prisma.buyerProfile.update({
      where: { id: user.buyerProfile?.id },
      data: { emailVerified: true },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.redirect(
      redirectPath(verificationSuccessPath(true), request)
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(
      redirectPath(verificationFailedPath('server_error'), request)
    )
  }
}
