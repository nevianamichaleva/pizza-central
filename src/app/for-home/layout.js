const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

export const metadata = {
  title: 'Доставка от Ресторант-пицария Централ Добрич',
  description: 'Поръчайте онлайн от Ресторант-пицария Централ в Добрич. Бърза доставка до дома или вземане на поръчка. Вкусна пица, основни ястия, салати и десерти. Официален сайт за доставка и takeaway.',
  keywords: ['доставка храна Добрич', 'доставка пица Добрич', 'поръчай храна онлайн Добрич', 'takeaway Добрич', 'доставка до дома Добрич'],
  alternates: {
    canonical: '/for-home',
  },
  openGraph: {
    title: 'Доставка от Ресторант-пицария Централ Добрич',
    description: 'Поръчайте онлайн от Ресторант-пицария Централ в Добрич. Бърза доставка до дома или вземане на поръчка.',
    type: 'website',
    url: `${baseUrl}/for-home`,
    images: [
      {
        url: `${baseUrl}/images/pizza-central-delivery.png`,
        width: 1200,
        height: 630,
        alt: 'Доставка от Ресторант-пицария Централ Добрич – пица, ястия и салати с доставка до дома',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Доставка от Ресторант-пицария Централ Добрич',
    description: 'Поръчайте онлайн от Ресторант-пицария Централ в Добрич. Бърза доставка до дома или вземане на поръчка.',
    images: [`${baseUrl}/images/pizza-central-delivery.png`],
  },
};

export default function ForHomeLayout({ children }) {
  return children;
}
