import '@ant-design/v5-patch-for-react-19';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../public/css/main.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import PageViewTracker from '../components/PageViewTracker';
import './globals.css';

import { CategoriesProvider } from '@/context/CategoriesContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { TranslationsProvider } from '@/context/TranslationsContext';
import { UserProvider } from '@/context/UserContext';

export const metadata = {
  title: {
    default: "Ресторант-пицария Централ Добрич",
    template: "%s | Ресторант-пицария Централ Добрич"
  },
  description: "Ресторант-пицария Централ (бивш Моцарела) в Добрич предлага вкусна храна, пица, основни ястия, обедни менюта, доставка до дома, детски кът и професионален кетъринг за събития",
  keywords: ["ресторант Добрич", "пицария Добрич", "доставка храна Добрич", "обедно меню Добрич", "резервация ресторант", "пица Добрич", "ястия Добрич", "детски кът Добрич", "ресторант с детски кът", "доставка храна", "доставка на храна Добрич", "Моцарела Добрич", "Моцарела ресторант Добрич", "бивш Моцарела Добрич", "кетъринг Добрич", "кетъринг услуги Добрич", "фирмен кетъринг Добрич", "кетъринг за събития", "кетъринг за рожден ден", "кетъринг за кръщене"],
  authors: [{ name: "Ресторант-пицария Централ" }],
  creator: "Ресторант-пицария Централ",
  publisher: "Ресторант-пицария Централ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg'),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg',
  },
    openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: '/',
    siteName: 'Ресторант-пицария Централ Добрич',
    title: 'Ресторант-пицария Централ Добрич',
    description: 'Ресторант-пицария Централ в Добрич предлага вкусна и здравословна храна, обедни менюта, доставка до дома, детски кът и професионален кетъринг за събития.',
    images: [
      {
        url: '/images/pizza-central-delivery.png',
        alt: 'Ресторант-пицария Централ Добрич',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ресторант-пицария Централ Добрич',
    description: 'Ресторант-пицария Централ в Добрич предлага вкусна и здравословна храна, обедни менюта, доставка до дома, детски кът и професионален кетъринг за събития.',
    images: ['/images/pizza-central-delivery.png'],
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
  icons: {
    icon: [
      { url: '/images/favicon.ico?v=2', sizes: 'any' },
      { url: '/images/favicon.png?v=2', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/images/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/images/favicon.ico?v=2',
  },
  verification: {
    google: 'vnY1LkfeFWmqka-8vSVYvovLtVjN30rrzLRFiz0qMbA',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body className="index-page">
        <UserProvider>
          <CategoriesProvider>
            <ProductsProvider>
              <TranslationsProvider>
                <PageViewTracker />
                <Header />
                <main>
                  {children}
                </main>
                <Footer />
                <ToastContainer />
              </TranslationsProvider>
            </ProductsProvider>
          </CategoriesProvider>
        </UserProvider>
      </body>
    </html>
  );
}
