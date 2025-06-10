import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();
    
    // Get token from cookies
    const cookieHeader = req.headers.get('cookie');
    const token = cookieHeader?.split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token and get user info
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id;

    // Get current user from database
    const result = await db.query('SELECT * FROM admin_credentials WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password in database
    await db.query(
      'UPDATE admin_credentials SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}