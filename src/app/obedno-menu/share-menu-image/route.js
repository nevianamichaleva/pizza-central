import { absolutizeOgImageUrl, fetchTodayLaunchMenuImageRawUrl } from '@/lib/launchMenuOgImage';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';
const FALLBACK = `${baseUrl}/images/launch/launch1.jpg`;

/** Facebook/OG ползват ~1.91:1; вертикалното меню иначе се подрязва. */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function fetchImageBuffer(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

export async function GET() {
  const raw = await fetchTodayLaunchMenuImageRawUrl();
  let target = absolutizeOgImageUrl(raw, baseUrl) || FALLBACK;

  let input = await fetchImageBuffer(target);
  if (!input && target !== FALLBACK) {
    input = await fetchImageBuffer(FALLBACK);
  }
  if (!input) {
    return new NextResponse('Image unavailable', { status: 502 });
  }

  try {
    const out = await sharp(input)
      .resize(OG_WIDTH, OG_HEIGHT, {
        fit: 'contain',
        background: { r: 245, g: 240, b: 235, alpha: 1 },
      })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();

    return new NextResponse(out, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, s-maxage=300, max-age=120',
      },
    });
  } catch {
    return new NextResponse('Image processing failed', { status: 502 });
  }
}
