const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

const canonicalUrl = `${baseUrl}/detski-kut`;
const ogImagePath = '/images/gallery/detski-kut1.jpg';

export const metadata = {
  title: 'Детски кът Добрич – семеен ресторант и рожден ден',
  description:
    'Детски кът в ресторант-пицария Централ, Добрич: безопасна зона за игра, подходяща за семейства и детски рожден ден (до 10 години). Родителите обядват спокойно, децата се забавляват.',
  keywords: [
    'детски кът Добрич',
    'детски кът ресторант',
    'детски рожден ден Добрич',
    'ресторант за деца Добрич',
    'семеен ресторант Добрич',
    'Pizza Central детски кът',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'Детски кът Добрич | Ресторант-пицария Централ',
    description:
      'Специален детски кът за игра и празници. Уют за семейства в центъра на Добрич – ул. Независимост 4.',
    url: canonicalUrl,
    siteName: 'Ресторант-пицария Централ Добрич',
    locale: 'bg_BG',
    type: 'website',
    images: [
      {
        url: `${baseUrl}${ogImagePath}`,
        width: 1200,
        height: 630,
        alt: 'Детски кът в ресторант-пицария Централ, Добрич',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Детски кът Добрич | Ресторант-пицария Централ',
    description:
      'Безопасна игрова зона за деца, подходяща за семейни обяди и детски рожден ден.',
    images: [`${baseUrl}${ogImagePath}`],
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
  image: `${baseUrl}${ogImagePath}`,
  description:
    'Ресторант-пицария в Добрич с детски кът за игра, семейни посещения и детски рожден ден.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Независимост 4',
    addressLocality: 'Добрич',
    addressCountry: 'BG',
  },
  telephone: ['+359895516401', '+359893315201'],
  servesCuisine: ['Италианска', 'Българска'],
  amenityFeature: {
    '@type': 'LocationFeatureSpecification',
    name: 'Детски кът',
    value: true,
  },
};

export default function DetskiKutLayout({ children }) {
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
