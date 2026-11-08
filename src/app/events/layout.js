const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

export const metadata = {
  title: 'Събития',
  alternates: {
    canonical: `${baseUrl}/events`,
  },
  description: 'Разгледайте предстоящите събития и специални предложения в Ресторант-пицария Централ в Добрич. Празници, тематични вечери и специални менюта.',
  keywords: ['събития ресторант Добрич', 'специални предложения Добрич', 'тематични вечери Добрич'],
  openGraph: {
    title: 'Събития - Ресторант-пицария Централ Добрич',
    description: 'Разгледайте предстоящите събития и специални предложения в Ресторант-пицария Централ в Добрич.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Събития - Ресторант-пицария Централ Добрич',
    description: 'Разгледайте предстоящите събития и специални предложения в Ресторант-пицария Централ в Добрич.',
  },
};

export default function EventsLayout({ children }) {
  return children;
}
