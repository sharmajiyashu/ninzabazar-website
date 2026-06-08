import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { redirectTo } from '@/lib/app-url'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(
        redirectTo('/verification-failed?error=missing_params', request)
      )
    }

    // Find the token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    })

    // Check if token exists and is valid
    if (!verificationToken || verificationToken.identifier !== email) {
      return NextResponse.redirect(
        redirectTo('/verification-failed?error=invalid_token', request)
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.redirect(
        redirectTo('/verification-failed?error=token_expired', request)
      )
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { buyerProfile: true },
    })

    if (!user) {
      return NextResponse.redirect(
        redirectTo('/verification-failed?error=user_not_found', request)
      )
    }

    // Update the user's verification status
    await prisma.buyerProfile.update({
      where: { id: user.buyerProfile?.id },
      data: { emailVerified: true },
    })

    // Delete the token after verification
    await prisma.verificationToken.delete({
      where: { token },
    })

    // Redirect to verification success page with a flag to refresh the session
    return NextResponse.redirect(
      redirectTo('/verification-success?refresh=true', request)
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(
      redirectTo('/verification-failed?error=server_error', request)
    )
  }
}
