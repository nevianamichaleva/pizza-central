const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pizza-central.bg';

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
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CateringRequestLayout({ children }) {
  return children;
}

