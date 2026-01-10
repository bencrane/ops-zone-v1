import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Generate a consistent token from the password
function generateToken(password: string): string {
  return crypto.createHash('sha256').update(password + 'ops-zone-salt').digest('hex');
}

export async function POST(request: Request) {
  const { password, remember = true } = await request.json();
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  
  // Generate a token from the password itself (no need for separate secret)
  const token = generateToken(password);
  
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: remember ? 60 * 60 * 24 * 90 : undefined, // 90 days if remember, session otherwise
    path: '/',
  });
  
  return NextResponse.json({ success: true });
}

