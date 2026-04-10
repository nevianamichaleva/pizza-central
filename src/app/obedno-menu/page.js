import ObednoMenuPageClient from './ObednoMenuPageClient';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

/** Винаги пресметнати meta/og при заявка (вкл. Facebook crawler), не само при build. */
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  /** Същият домейн + 302 към днешното изображение от Firebase (като `<img src>` на страницата). */
  const ogImageUrl = `${baseUrl.replace(/\/$/, '')}/obedno-menu/share-menu-image`;

  const title = 'Обедно меню Добрич | Дневно меню за обяд | Ресторант-пицария Централ';
  const description =
    'Обедно меню в ресторант-пицария Централ Добрич. Вкусни ястия на достъпни цени всеки работен ден от 11 до 15 часа. Традиционни български ястия, салати и супи. Разгледайте нашето дневно обедно меню.';

  const ogImages = [
    {
      url: ogImageUrl,
      width: 1200,
      height: 630,
      alt: 'Обедно меню в ресторант-пицария Централ Добрич',
    },
  ];

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: [
      'обедно меню Добрич',
      'дневно меню Добрич',
      'обед ресторант Добрич',
      'меню за обяд',
      'обедно меню',
      'дневно меню',
      'обед ресторант',
      'меню за обяд Добрич',
      'обедно меню ресторант',
      'дневно обедно меню',
      'обедни ястия Добрич',
      'обедна храна Добрич',
      'ресторант обедно меню',
      'обедно меню цени',
      'обедно меню работен ден',
      'обедно меню 11-15 часа',
      'обедно меню Централ Добрич',
    ],
    alternates: {
      canonical: '/obedno-menu',
    },
    openGraph: {
      title: 'Обедно меню Добрич | Дневно меню за обяд | Ресторант-пицария Централ',
      description:
        'Обедно меню в ресторант-пицария Централ Добрич. Вкусни ястия на достъпни цени всеки работен ден от 11 до 15 часа.',
      url: '/obedno-menu',
      siteName: 'Ресторант-пицария Централ Добрич',
      locale: 'bg_BG',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Обедно меню Добрич | Дневно меню за обяд',
      description:
        'Обедно меню в ресторант-пицария Централ Добрич. Вкусни ястия на достъпни цени всеки работен ден от 11 до 15 часа.',
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function ObednoMenuPage() {
  return <ObednoMenuPageClient />;
}
