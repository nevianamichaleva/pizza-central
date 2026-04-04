const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

export const metadata = {
  title: 'Заяви кетъринг | Ресторант-пицария Централ Добрич',
  description: 'Попълнете формата за заявка за кетъринг. Ще се свържем с вас, за да уговорим час за консултация и уточняване на детайли и цени.',
  alternates: {
    canonical: `${baseUrl}/catering/zaiavka`,
  },
  openGraph: {
    title: 'Заяви кетъринг | Ресторант-пицария Централ',
    description: 'Попълнете формата за заявка за кетъринг. Ще се свържем с вас, за да уговорим час за консултация.',
    url: `${baseUrl}/catering/zaiavka`,
    siteName: 'Ресторант-пицария Централ Добрич',
    locale: 'bg_BG',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/images/catering/1000032298.jpg`,
        width: 1200,
        height: 630,
        alt: 'Кетъринг – Ресторант-пицария Централ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Заяви кетъринг | Ресторант-пицария Централ',
    description:
      'Попълнете формата за заявка. Ще уточним менюто, обема и цените за вашето събитие.',
    images: [`${baseUrl}/images/catering/1000032298.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CateringRequestLayout({ children }) {
  return children;
}

