const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

const canonicalUrl = `${baseUrl}/for-home`;

export const metadata = {
  title: 'Доставка на храна Добрич | Поръчай онлайн | Ресторант Централ',
  description:
    'Поръчайте пица, ястия и салати с доставка до адрес в Добрич или takeaway от ресторант Централ (ул. Независимост 4). Официален сайт: отстъпки за регистрирани, ясни условия в количката. Работно време 10–22 ч.',
  keywords: [
    'доставка храна Добрич',
    'доставка пица Добрич',
    'поръчай храна онлайн Добрич',
    'takeaway Добрич',
    'доставка до дома Добрич',
    'ресторант Централ доставка',
    'Pizza Central доставка',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'Доставка на храна Добрич | Ресторант-пицария Централ',
    description:
      'Онлайн поръчки с доставка или вземане от място. Вкусна пица и ястия от Централ – официален сайт.',
    type: 'website',
    url: canonicalUrl,
    siteName: 'Ресторант-пицария Централ Добрич',
    locale: 'bg_BG',
    images: [
      {
        url: `${baseUrl}/images/pizza-central-delivery.png`,
        alt: 'Доставка от Ресторант-пицария Централ Добрич – пица, ястия и салати с доставка до дома',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Доставка Добрич | Ресторант-пицария Централ',
    description:
      'Поръчайте онлайн или по телефон. Takeaway и доставка до адрес.',
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
  '@type': 'Restaurant',
  name: 'Ресторант-пицария Централ',
  url: canonicalUrl,
  image: `${baseUrl}/images/pizza-central-delivery.png`,
  description:
    'Пица, основни ястия и салати с доставка до адрес в Добрич и вземане от ресторанта.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Независимост 4',
    addressLocality: 'Добрич',
    addressCountry: 'BG',
  },
  telephone: ['+359895516401', '+359893315201'],
  servesCuisine: ['Италианска', 'Българска'],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '22:00',
    },
  ],
};

export default function ForHomeLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
