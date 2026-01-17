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
    url: '/for-home',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Доставка от Ресторант-пицария Централ Добрич',
    description: 'Поръчайте онлайн от Ресторант-пицария Централ в Добрич. Бърза доставка до дома или вземане на поръчка.',
  },
};

export default function ForHomeLayout({ children }) {
  return children;
}
