import ForHomeClient from './ForHomeClient';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';
const canonicalUrl = `${baseUrl}/for-home`;

const pageTitle =
  'Доставка на храна и пица Добрич | Поръчай онлайн | Takeaway | Централ';
const pageDescription =
  'Доставка на пица, паста, салати и ястия до адрес в Добрич от ресторант-пицария Централ (ул. Независимост 4). Официален сайт, поръчка без посредник, takeaway. Отстъпки за регистрирани. Работим 10:00–22:00 ч.';

export const metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  keywords: [
    'доставка храна Добрич',
    'доставка пица Добрич',
    'доставка до дома Добрич',
    'поръчка храна онлайн Добрич',
    'доставка ресторант Добрич',
    'takeaway Добрич',
    'вземане от място ресторант Добрич',
    'пица с доставка Добрич',
    'италианска пица Добрич',
    'поръчай пица Добрич',
    'храна до вкъщи Добрич',
    'ресторант Централ доставка',
    'Pizza Central Добрич доставка',
    'официален сайт доставка Централ',
    'доставка без посредник Добрич',
    'ул. Независимост 4 доставка',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: 'website',
    url: canonicalUrl,
    siteName: 'Ресторант-пицария Централ Добрич',
    locale: 'bg_BG',
    images: [
      {
        url: `${baseUrl}/images/pizza-central-delivery.png`,
        width: 1200,
        height: 630,
        alt: 'Доставка на пица и храна в Добрич от ресторант-пицария Централ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [`${baseUrl}/images/pizza-central-delivery.png`],
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: pageTitle,
      description: pageDescription,
      inLanguage: 'bg-BG',
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        name: 'Ресторант-пицария Централ Добрич',
        url: baseUrl,
      },
      about: { '@id': `${baseUrl}/#restaurant` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/pizza-central-delivery.png`,
      },
      breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Начало',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Доставка и takeaway',
          item: canonicalUrl,
        },
      ],
    },
    {
      '@type': 'Restaurant',
      '@id': `${baseUrl}/#restaurant`,
      name: 'Ресторант-пицария Централ',
      url: baseUrl,
      image: [`${baseUrl}/images/pizza-central-delivery.png`],
      description:
        'Пица, паста, салати и основни ястия — доставка до адрес в Добрич и вземане от ресторанта на ул. Независимост 4.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ул. Независимост 4',
        addressLocality: 'Добрич',
        postalCode: '9300',
        addressCountry: 'BG',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 43.56913,
        longitude: 27.82433,
      },
      telephone: ['+359895516401', '+359893315201'],
      servesCuisine: ['Италианска', 'Българска'],
      priceRange: '$$',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '10:00',
          closes: '22:00',
        },
      ],
      areaServed: {
        '@type': 'City',
        name: 'Добрич',
      },
      hasMenu: `${baseUrl}/central-menu`,
      sameAs: ['https://www.facebook.com/CentralDobrich'],
    },
  ],
};

export default function ForHomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ForHomeClient />
    </>
  );
}
