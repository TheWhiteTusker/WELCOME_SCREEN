import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendOTPEmail } from '@/lib/email';

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validate email format
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // First check if user exists
    const userResult = await db.query(
      'SELECT email FROM admin_credentials WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: `No account found with email: ${email}. Please check your email.` },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Store OTP in database
    try {
      await db.query(
        'INSERT INTO password_reset_otps (email, otp, expires_at) VALUES ($1, $2, $3)',
        [email, otp, expiresAt]
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to process your request. Please try again later.' },
        { status: 500 }
      );
    }

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'OTP sent successfully',
      email: email // Send back the email for frontend reference
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
} 