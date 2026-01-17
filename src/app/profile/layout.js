export const metadata = {
  title: 'Профил - Ресторант-пицария Централ Добрич',
  description: 'Управлявайте профила си в Ресторант-пицария Централ в Добрич. Прегледайте поръчките и резервациите си.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Профил - Ресторант-пицария Централ Добрич',
    description: 'Управлявайте профила си в Ресторант-пицария Централ в Добрич.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Профил - Ресторант-пицария Централ Добрич',
    description: 'Управлявайте профила си в Ресторант-пицария Централ в Добрич.',
  },
};

export default function ProfileLayout({ children }) {
  return children;
}
