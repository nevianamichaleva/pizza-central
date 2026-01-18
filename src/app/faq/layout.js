const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

export const metadata = {
  title: 'Често задавани въпроси | FAQ | Ресторант-пицария Централ Добрич',
  description: 'Често задавани въпроси за Ресторант-пицария Централ в Добрич. Информация за доставка, резервации, менюта, детски кът, плащане и специални събития. Намерете отговори на всички ваши въпроси.',
  keywords: [
    'FAQ ресторант Добрич',
    'често задавани въпроси',
    'доставка храна Добрич',
    'резервация ресторант',
    'детски кът Добрич',
    'работно време ресторант',
    'плащане ресторант',
    'вегетарианско меню',
    'детско меню',
    'специални събития ресторант',
    'кейтъринг Добрич',
    'ресторант Централ Добрич'
  ],
  alternates: {
    canonical: `${baseUrl}/faq`,
  },
  openGraph: {
    title: 'Често задавани въпроси | FAQ | Ресторант-пицария Централ Добрич',
    description: 'Често задавани въпроси за Ресторант-пицария Централ в Добрич. Информация за доставка, резервации, менюта, детски кът и специални събития.',
    url: `${baseUrl}/faq`,
    siteName: 'Ресторант-пицария Централ Добрич',
    locale: 'bg_BG',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/images/pizza-central-delivery.png`,
        width: 1200,
        height: 630,
        alt: 'Ресторант-пицария Централ Добрич - FAQ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Често задавани въпроси | FAQ | Ресторант-пицария Централ',
    description: 'Често задавани въпроси за Ресторант-пицария Централ в Добрич. Информация за доставка, резервации, менюта и специални събития.',
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

export default function FAQLayout({ children }) {
  return children;
}
