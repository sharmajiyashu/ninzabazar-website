import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verification-failed?error=missing_params`
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
        `${process.env.NEXTAUTH_URL}/verification-failed?error=invalid_token`
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verification-failed?error=token_expired`
      )
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { buyerProfile: true },
    })

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verification-failed?error=user_not_found`
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
      `${process.env.NEXTAUTH_URL}/verification-success?refresh=true`
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/verification-failed?error=server_error`
    )
  }
}
