import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { absoluteUrl } from '@/lib/app-url'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        const { email } = await request.json()

        // Make sure user is authenticated and emails match
        if (!session || session.user.email !== email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { buyerProfile: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if already verified
        if (user.buyerProfile?.emailVerified) {
            return NextResponse.json(
                { message: 'Email already verified' },
                { status: 200 }
            )
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

        // Delete any existing tokens for this user
        await prisma.verificationToken.deleteMany({
            where: { identifier: email },
        })

        // Store new verification token
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: verificationToken,
                expires: tokenExpiry,
            },
        })

        const verificationUrl = absoluteUrl(
            `/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`,
            request
        )

        // Send verification email
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT
                ? Number(process.env.EMAIL_SERVER_PORT)
                : 587,
            secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        })

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Verify Your Email Address - Ninja Bazaar',
            text: `Welcome to Ninja Bazaar! Please verify your email by clicking on this link: ${verificationUrl}`,
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - Ninja Bazaar</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    line-height: 1.6;
                    color: #334155;
                    background-color: #f8fafc;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                
                .header {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    padding: 40px 30px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                    animation: float 20s ease-in-out infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                .logo {
                    font-size: 28px;
                    font-weight: 700;
                    color: #ffffff;
                    margin-bottom: 8px;
                    position: relative;
                    z-index: 1;
                }
                
                .tagline {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 14px;
                    position: relative;
                    z-index: 1;
                }
                
                .content {
                    padding: 40px 30px;
                    text-align: center;
                }
                
                .welcome-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 16px;
                }
                
                .welcome-text {
                    font-size: 16px;
                    color: #64748b;
                    margin-bottom: 32px;
                    line-height: 1.5;
                }
                
                .verify-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    color: #ffffff;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 16px;
                    margin-bottom: 32px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
                }
                
                .verify-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
                }
                
                .alternative-link {
                    background-color: #f1f5f9;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 24px;
                }
                
                .alternative-text {
                    font-size: 14px;
                    color: #64748b;
                    margin-bottom: 8px;
                }
                
                .link-text {
                    font-size: 12px;
                    color: #059669;
                    word-break: break-all;
                    text-decoration: none;
                }
                
                .footer-info {
                    font-size: 14px;
                    color: #64748b;
                    margin-bottom: 16px;
                }
                
                .security-note {
                    font-size: 12px;
                    color: #94a3b8;
                    font-style: italic;
                }
                
                .footer {
                    background-color: #f8fafc;
                    padding: 24px 30px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                
                .footer-text {
                    font-size: 12px;
                    color: #94a3b8;
                    margin-bottom: 8px;
                }
                
                .social-links {
                    margin-top: 16px;
                }
                
                .social-link {
                    display: inline-block;
                    margin: 0 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-size: 12px;
                }
                
                .divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                    margin: 24px 0;
                }
                
                @media (max-width: 600px) {
                    .email-container {
                        margin: 0 16px;
                        border-radius: 12px;
                    }
                    
                    .header {
                        padding: 32px 20px;
                    }
                    
                    .content {
                        padding: 32px 20px;
                    }
                    
                    .welcome-title {
                        font-size: 20px;
                    }
                    
                    .verify-button {
                        padding: 14px 28px;
                        font-size: 15px;
                    }
                    
                    .footer {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div style="padding: 40px 16px; background-color: #f8fafc; min-height: 100vh;">
                <div class="email-container">
                    <div class="header">
                        <div class="logo">Ninja Bazaar</div>
                        <div class="tagline">Your Ultimate Shopping Destination</div>
                    </div>
                    
                    <div class="content">
                        <h1 class="welcome-title">Welcome to Ninja Bazaar!</h1>
                        <p class="welcome-text">
                            Thanks for joining our community of smart shoppers. To get started and access all our amazing deals, please verify your email address.
                        </p>
                        
                        <a href="${verificationUrl}" class="verify-button">
                            Verify Email Address
                        </a>
                        
                        <div class="alternative-link">
                            <p class="alternative-text">Button not working? Copy and paste this link into your browser:</p>
                            <a href="${verificationUrl}" class="link-text">${verificationUrl}</a>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <p class="footer-info">
                            <strong>⏰ This verification link expires in 24 hours.</strong>
                        </p>
                        
                        <p class="security-note">
                            If you didn't create an account with Ninja Bazaar, please ignore this email and no further action is required.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p class="footer-text">
                            <strong>Ninja Bazaar</strong> - Fast Paced Items Starting At $150
                        </p>
                        <p class="footer-text">
                            Need help? Contact our support team at support@ninjabazaar.com
                        </p>
                        
                        <div class="social-links">
                            <a href="#" class="social-link">Privacy Policy</a>
                            <a href="#" class="social-link">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `,
        }

        if (process.env.EMAIL_SERVER_HOST === 'smtp.example.com') {
            console.log('\n=== MOCK EMAIL SENT ===')
            console.log(`To: ${email}`)
            console.log(`Verification URL: ${verificationUrl}`)
            console.log('=======================\n')
        } else {
            await transporter.sendMail(mailOptions)
        }

        return NextResponse.json(
            { message: 'Verification email sent successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error sending verification email:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
