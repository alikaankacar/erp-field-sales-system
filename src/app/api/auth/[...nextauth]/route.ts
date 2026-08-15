import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export async function GET(request: NextRequest) {
  return handler(request as any);
}

export async function POST(request: NextRequest) {
  return handler(request as any);
}
