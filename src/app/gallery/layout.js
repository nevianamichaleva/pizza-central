const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

export const metadata = {
  title: 'Галерия',
  alternates: {
    canonical: `${baseUrl}/gallery`,
  },
  description: 'Разгледайте галерията с снимки от Ресторант-пицария Централ в Добрич. Вижте нашата обстановка, ястия, детски кът и събития.',
  keywords: ['галерия ресторант Добрич', 'снимки ресторант Добрич', 'ресторант Централ галерия'],
  openGraph: {
    title: 'Галерия - Ресторант-пицария Централ Добрич',
    description: 'Разгледайте галерията с снимки от Ресторант-пицария Централ в Добрич.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Галерия - Ресторант-пицария Централ Добрич',
    description: 'Разгледайте галерията с снимки от Ресторант-пицария Централ в Добрич.',
  },
};

export default function GalleryLayout({ children }) {
  return children;
}
