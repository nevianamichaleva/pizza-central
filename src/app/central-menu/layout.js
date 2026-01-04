const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pizza-central.bg';

export const metadata = {
  title: 'Меню на Ресторант-пицария Централ град Добрич | Ресторант-пицария Централ Добрич',
  description: 'Разгледайте нашето меню с вкусни пици, основни ястия, салати, гарнитури и десерти. Ресторант-пицария Централ в Добрич предлага автентична италианска пица и традиционна българска кухня.',
  alternates: {
    canonical: `${baseUrl}/central-menu`,
    languages: {
      'bg': `${baseUrl}/central-menu`,
      'en': `${baseUrl}/en/central-menu`,
      'ro': `${baseUrl}/ro/central-menu`,
      'de': `${baseUrl}/de/central-menu`,
      'x-default': `${baseUrl}/central-menu`,
    },
  },
  openGraph: {
    title: 'Меню на Ресторант-пицария Централ град Добрич',
    description: 'Разгледайте нашето меню с вкусни пици, основни ястия, салати, гарнитури и десерти. Ресторант-пицария Централ в Добрич предлага автентична италианска пица и традиционна българска кухня.',
    url: `${baseUrl}/central-menu`,
    siteName: 'Ресторант-пицария Централ Добрич',
    locale: 'bg_BG',
    type: 'website',
    images: [
      {
        url: '/images/pizza-central-delivery.png',
        width: 1200,
        height: 630,
        alt: 'Меню на Ресторант-пицария Централ град Добрич',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Меню на Ресторант-пицария Централ град Добрич',
    description: 'Разгледайте нашето меню с вкусни пици, основни ястия, салати, гарнитури и десерти. Ресторант-пицария Централ в Добрич предлага автентична италианска пица и традиционна българска кухня.',
    images: ['/images/pizza-central-delivery.png'],
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

export default function CentralMenuLayout({ children }) {
  return children;
}





