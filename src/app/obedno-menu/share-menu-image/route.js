import { absolutizeOgImageUrl, fetchTodayLaunchMenuImageRawUrl } from '@/lib/launchMenuOgImage';
import { NextResponse } from 'next/server';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';
const FALLBACK = `${baseUrl}/images/launch/launch1.jpg`;

/** 302 към днешното меню снимка — полезно за споделяне (краулери следват пренасочването). */
export const dynamic = 'force-dynamic';

export async function GET() {
  const raw = await fetchTodayLaunchMenuImageRawUrl();
  const target = absolutizeOgImageUrl(raw, baseUrl) || FALLBACK;
  return NextResponse.redirect(target, 302);
}
