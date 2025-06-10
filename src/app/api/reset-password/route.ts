import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const result = await db.query(
      `SELECT * FROM password_reset_otps 
       WHERE email = $1 AND otp = $2 AND used = false 
       AND expires_at > CURRENT_TIMESTAMP 
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE admin_credentials SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );

    // Mark OTP as used
    await db.query(
      'UPDATE password_reset_otps SET used = true WHERE id = $1',
      [result.rows[0].id]
    );

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password. Please try again.' },
      { status: 500 }
    );
  }
} 