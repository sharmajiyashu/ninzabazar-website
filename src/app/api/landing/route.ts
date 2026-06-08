import { NextResponse } from 'next/server';
import { getLandingPageData } from '@/lib/landing-page';

export async function GET() {
  try {
    const data = await getLandingPageData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return NextResponse.json({ error: 'Failed to fetch landing page' }, { status: 500 });
  }
}
