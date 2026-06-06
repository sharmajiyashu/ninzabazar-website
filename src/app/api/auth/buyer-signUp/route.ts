import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/hashPassword'
import nodemailer from 'nodemailer'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, contactNumber, password } =
      await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    // Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        contactNumber: contactNumber.toString(),
        role: 'BUYER',
        password: hashedPassword,
        buyerProfile: {
          create: {
            emailVerified: false,
          },
        },
      },
      include: {
        buyerProfile: true,
      },
    })

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpiry,
      },
    })

    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    // Send confirmation email to the user
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT
        ? Number(process.env.EMAIL_SERVER_PORT)
        : 587, // Ensure it's a number
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email, // Send email to the newly registered user
      subject:
        'Welcome to Ninja Bazaar! Please Check Your Email for Verification',
      text: `Hello ${firstName} ${lastName},\n\nWelcome to Ninja Bazaar! We're excited to have you join our community of smart shoppers.\n\nIMPORTANT: Please check your email for a verification message we just sent you. You'll need to verify your email address to access all our features and start shopping.\n\nIf you don't see the verification email in your inbox, please check your spam/junk folder.\n\nBest regards,\nThe Ninja Bazaar Team`,
      html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Ninja Bazaar!</title>
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
                    }
                    
                    .welcome-title {
                        font-size: 24px;
                        font-weight: 600;
                        color: #1e293b;
                        margin-bottom: 16px;
                        text-align: center;
                    }
                    
                    .welcome-text {
                        font-size: 16px;
                        color: #64748b;
                        margin-bottom: 24px;
                        text-align: center;
                    }
                    
                    .verification-notice {
                        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                        border: 1px solid #f59e0b;
                        border-radius: 12px;
                        padding: 20px;
                        margin: 24px 0;
                        text-align: center;
                    }
                    
                    .verification-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #92400e;
                        margin-bottom: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    }
                    
                    .verification-text {
                        font-size: 14px;
                        color: #a16207;
                        line-height: 1.5;
                    }
                    
                    .email-icon {
                        font-size: 20px;
                    }
                    
                    .features-section {
                        background-color: #f8fafc;
                        border-radius: 12px;
                        padding: 24px;
                        margin: 24px 0;
                    }
                    
                    .features-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1e293b;
                        margin-bottom: 16px;
                        text-align: center;
                    }
                    
                    .features-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 16px;
                    }
                    
                    .feature-item {
                        background: white;
                        border-radius: 8px;
                        padding: 16px;
                        border: 1px solid #e2e8f0;
                        text-align: center;
                    }
                    
                    .feature-icon {
                        font-size: 24px;
                        margin-bottom: 8px;
                    }
                    
                    .feature-title {
                        font-size: 14px;
                        font-weight: 600;
                        color: #1e293b;
                        margin-bottom: 4px;
                    }
                    
                    .feature-desc {
                        font-size: 12px;
                        color: #64748b;
                    }
                    
                    .divider {
                        height: 1px;
                        background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                        margin: 24px 0;
                    }
                    
                    .help-section {
                        background-color: #f1f5f9;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 24px 0;
                        text-align: center;
                    }
                    
                    .help-text {
                        font-size: 14px;
                        color: #64748b;
                        margin-bottom: 8px;
                    }
                    
                    .contact-link {
                        color: #059669;
                        text-decoration: none;
                        font-weight: 500;
                    }
                    
                    .verify-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #059669 0%, #047857 100%);
                        color: #ffffff;
                        text-decoration: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
                    }
                    
                    .verify-button:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
                    }
                    
                    .signature {
                        font-size: 16px;
                        color: #1e293b;
                        margin-top: 24px;
                        text-align: center;
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
                    
                    .footer-links {
                        margin-top: 16px;
                    }
                    
                    .footer-link {
                        color: #059669;
                        text-decoration: none;
                        font-size: 12px;
                        margin: 0 8px;
                    }
                    
                    .footer-link:hover {
                        text-decoration: underline;
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
                        
                        .features-grid {
                            grid-template-columns: 1fr;
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
                            <h1 class="welcome-title">Welcome to Ninja Bazaar, ${firstName}!</h1>
                            <p class="welcome-text">
                                We're thrilled to have you join our community of smart shoppers. Get ready to discover amazing deals starting at just $150!
                            </p>
                            
                            <div class="verification-notice">
                                <div class="verification-title">
                                    <span class="email-icon">📧</span>
                                    Important: Check Your Email!
                                </div>
                                <p class="verification-text">
                                    We've sent you a verification email. Please check your inbox and click the verification link to activate your account and start shopping.
                                    <br><br>
                                    <strong>Don't see it? Check your spam/junk folder!</strong>
                                </p>
                                
                                <div style="text-align: center; margin-top: 16px;">
                                    <a href="${verificationUrl}" class="verify-button">
                                        Verify Now
                                    </a>
                                </div>
                            </div>
                            
                            <div class="features-section">
                                <h2 class="features-title">What's waiting for you after verification:</h2>
                                <div class="features-grid">
                                    <div class="feature-item">
                                        <div class="feature-icon">🛍️</div>
                                        <div class="feature-title">Exclusive Deals</div>
                                        <div class="feature-desc">Access member-only discounts and flash sales</div>
                                    </div>
                                    <div class="feature-item">
                                        <div class="feature-icon">⚡</div>
                                        <div class="feature-title">Fast Shopping</div>
                                        <div class="feature-desc">Quick checkout and lightning-fast delivery</div>
                                    </div>
                                    <div class="feature-item">
                                        <div class="feature-icon">👤</div>
                                        <div class="feature-title">Personal Dashboard</div>
                                        <div class="feature-desc">Track orders and manage your profile</div>
                                    </div>
                                    <div class="feature-item">
                                        <div class="feature-icon">🎯</div>
                                        <div class="feature-title">Smart Recommendations</div>
                                        <div class="feature-desc">Personalized product suggestions just for you</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <div class="help-section">
                                <p class="help-text">Need help or have questions?</p>
                                <p class="help-text">Our support team is here to help! Contact us at <a href="mailto:support@ninjabazaar.com" class="contact-link">support@ninjabazaar.com</a></p>
                            </div>
                            
                            <div class="signature">
                                <p>Welcome aboard!</p>
                                <p><strong>The Ninja Bazaar Team</strong></p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">
                                <strong>Ninja Bazaar</strong> - Fast Paced Items Starting At $150
                            </p>
                            <p class="footer-text">
                                © ${new Date().getFullYear()} Ninja Bazaar. All rights reserved.
                            </p>
                            
                            <div class="footer-links">
                                <a href="${process.env.NEXTAUTH_URL}/privacy" class="footer-link">Privacy Policy</a>
                                <a href="${process.env.NEXTAUTH_URL}/terms" class="footer-link">Terms of Service</a>
                                <a href="mailto:support@ninjabazaar.com" class="footer-link">Support</a>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
    }

    // Send the email
    if (process.env.EMAIL_SERVER_HOST === 'smtp.example.com') {
      console.log('\n=== MOCK EMAIL SENT ===')
      console.log(`To: ${email}`)
      console.log(`Verification URL: ${verificationUrl}`)
      console.log('=======================\n')
    } else {
      await transporter.sendMail(mailOptions)
    }

    if (!newUser) {
      console.error('Error inserting user')
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in buyer signup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
