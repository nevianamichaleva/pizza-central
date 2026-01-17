const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

export const metadata = {
  title: 'Обедно меню Добрич | Дневно меню за обяд | Ресторант-пицария Централ',
  description: 'Обедно меню в ресторант-пицария Централ Добрич. Вкусни ястия на достъпни цени всеки работен ден от 11 до 15 часа. Традиционни български ястия, салати и супи. Разгледайте нашето дневно обедно меню.',
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
    'обедно меню Централ Добрич'
  ],
  alternates: {
    canonical: `${baseUrl}/obedno-menu`,
  },
  openGraph: {
    title: 'Обедно меню Добрич | Дневно меню за обяд | Ресторант-пицария Централ',
    description: 'Обедно меню в ресторант-пицария Централ Добрич. Вкусни ястия на достъпни цени всеки работен ден от 11 до 15 часа.',
    url: `${baseUrl}/obedno-menu`,
    siteName: 'Ресторант-пицария Централ Добрич',
    locale: 'bg_BG',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/images/launch/launch1.jpg`,
        width: 1200,
        height: 630,
        alt: 'Обедно меню в ресторант-пицария Централ Добрич',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Обедно меню Добрич | Дневно меню за обяд',
    description: 'Обедно меню в ресторант-пицария Централ Добрич. Вкусни ястия на достъпни цени всеки работен ден от 11 до 15 часа.',
    images: [`${baseUrl}/images/launch/launch1.jpg`],
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

export default function ObednoMenuLayout({ children }) {
  return children;
}
