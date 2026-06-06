import NextAuth, { NextAuthOptions, User } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import { comparePassword } from './hashPassword'

interface CustomUser extends User {
  id: string
  email: string
  name: string
  role: string
  emailVerified?: boolean
  buyerProfile?: { emailVerified: boolean }
  storeStatus?: string
  sellerProfile?: { storeStatus: string }
}

interface GoogleProfile {
  given_name?: string
  family_name?: string
  name?: string
  email?: string
  picture?: string
  [key: string]: number | string | undefined
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google client ID or secret')
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: { email: {}, password: {}, role: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }
        console.log('Attempting login for:', credentials.email)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            buyerProfile: {
              select: {
                emailVerified: true,
              },
            },
            sellerProfile: {
              select: {
                storeStatus: true,
              },
            },
          },
        })

        if (user?.role !== credentials.role) {
          throw new Error(
            `Invalid account type. Please use the ${credentials.role} login page.`
          )
        }
        if (!user) {
          throw new Error('User not found')
        }
        if (!user.password) {
          throw new Error('User password is missing')
        }

        const validatePassword = await comparePassword(
          credentials.password,
          user.password
        )
        if (!validatePassword) {
          throw new Error('Incorrect Password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.firstName,
          role: user.role,
          image: user.profilePicture,
          emailVerified: user?.buyerProfile?.emailVerified,
          storeStatus: user?.sellerProfile?.storeStatus || null,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days validity for session
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/not-found',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const googleProfile = profile as GoogleProfile

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
              buyerProfile: true,
              sellerProfile: true,
              oauthAccounts: true,
            },
          })

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                firstName:
                  googleProfile?.given_name ||
                  user.name?.split(' ')[0] ||
                  'User',
                lastName:
                  googleProfile?.family_name ||
                  user.name?.split(' ').slice(1).join(' ') ||
                  '',
                profilePicture: user.image,
                role: 'BUYER',
                contactNumber: '',
                buyerProfile: {
                  create: {
                    profilePicture: user.image,
                    emailVerified: true, // Google users are auto-verified
                  },
                },
                oauthAccounts: {
                  create: {
                    provider: 'GOOGLE',
                    providerAccountId: account.providerAccountId,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expiresAt: account.expires_at
                      ? new Date(account.expires_at * 1000)
                      : null,
                    idToken: account.id_token,
                  },
                },
              },
            })
            console.log('Created new OAuth user:', newUser.email)
          } else {
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                profilePicture: user.image,
                updatedAt: new Date(),
              },
            })

            const existingOAuthAccount = existingUser.oauthAccounts.find(
              (acc) =>
                acc.provider === 'GOOGLE' &&
                acc.providerAccountId === account.providerAccountId
            )

            if (!existingOAuthAccount) {
              await prisma.oAuthAccount.create({
                data: {
                  provider: 'GOOGLE',
                  providerAccountId: account.providerAccountId,
                  userId: existingUser.id,
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                  expiresAt: account.expires_at
                    ? new Date(account.expires_at * 1000)
                    : null,
                  idToken: account.id_token,
                },
              })
            } else {
              await prisma.oAuthAccount.update({
                where: { id: existingOAuthAccount.id },
                data: {
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                  expiresAt: account.expires_at
                    ? new Date(account.expires_at * 1000)
                    : null,
                  idToken: account.id_token,
                  updatedAt: new Date(),
                },
              })
            }

            console.log('Updated existing OAuth user:', existingUser.email)
          }
          return true
        } catch (error) {
          console.error('Error saving OAuth user to database:', error)
          return false
        }
      }
      return true
    },
    jwt: async ({ token, user, account, trigger }) => {
      const CUser = user as CustomUser

      if (user) {
        if (account?.provider === 'google') {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              email: true,
              firstName: true,
              role: true,
              profilePicture: true,
              buyerProfile: {
                select: {
                  emailVerified: true,
                },
              },
              sellerProfile: {
                select: {
                  storeStatus: true,
                },
              },
            },
          })

          if (dbUser) {
            token.id = dbUser.id
            token.email = dbUser.email
            token.name = dbUser.firstName
            token.role = dbUser.role
            token.picture = dbUser.profilePicture ?? undefined
            token.emailVerified = dbUser.buyerProfile?.emailVerified ?? true // Google users default to verified
            token.storeStatus = dbUser.sellerProfile?.storeStatus
          }
        } else {
          // Credentials login
          token.id = CUser.id
          token.email = CUser.email
          token.name = CUser.name
          token.role = CUser.role
          token.picture = CUser.image ?? undefined
          token.emailVerified = CUser.emailVerified
          token.storeStatus = CUser.storeStatus
        }
      }

      // Handle session update trigger (when update() is called)
      if (trigger === 'update') {
        console.log('🔄 Refreshing token from database...')
        try {
          const updatedUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: {
              buyerProfile: {
                select: {
                  emailVerified: true,
                },
              },
            },
          })

          if (updatedUser) {
            token.emailVerified =
              updatedUser.buyerProfile?.emailVerified ?? false
            console.log(
              '✅ Token updated - emailVerified:',
              token.emailVerified
            )
          }
        } catch (error) {
          console.error('❌ Error updating token:', error)
        }
      }

      return token
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          image: token.picture,
          emailVerified: token.emailVerified,
          storeStatus: token.storeStatus,
        },
      }
    },
  },
}

export default NextAuth(authOptions)
