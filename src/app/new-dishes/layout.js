const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

export const metadata = {
  title: 'Нови предложения',
  alternates: {
    canonical: `${baseUrl}/new-dishes`,
  },
  description: 'Разгледайте новите ястия и предложения в Ресторант-пицария Централ в Добрич. Свежи рецепти и вкусни новости от нашата кухня.',
  keywords: ['нови ястия Добрич', 'нови предложения ресторант Добрич', 'нови рецепти Добрич'],
  openGraph: {
    title: 'Нови предложения - Ресторант-пицария Централ Добрич',
    description: 'Разгледайте новите ястия и предложения в Ресторант-пицария Централ в Добрич.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Нови предложения - Ресторант-пицария Централ Добрич',
    description: 'Разгледайте новите ястия и предложения в Ресторант-пицария Централ в Добрич.',
  },
};

export default function NewDishesLayout({ children }) {
  return children;
}
