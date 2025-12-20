import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';
import '../../public/css/main.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import './globals.css';

import { CategoriesProvider } from '@/context/CategoriesContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { UserProvider } from '@/context/UserContext';

export const metadata = {
  title: {
    default: "Ресторант-пицария Централ Добрич",
    template: "%s | Ресторант-пицария Централ Добрич"
  },
  description: "Ресторант-пицария Централ (бивш Моцарела) в Добрич предлага вкусна и здравословна храна, пица, основни ястия, обедни менюта и доставка до дома. Разполагаме с детски кът за вашите деца. Резервирайте маса или поръчайте.",
  keywords: ["ресторант Добрич", "пицария Добрич", "доставка храна Добрич", "обедно меню Добрич", "резервация ресторант", "пица Добрич", "ястия Добрич", "детски кът Добрич", "ресторант с детски кът", "доставка храна", "доставка на храна Добрич", "Моцарела Добрич", "Моцарела ресторант Добрич", "бивш Моцарела Добрич"],
  authors: [{ name: "Ресторант-пицария Централ" }],
  creator: "Ресторант-пицария Централ",
  publisher: "Ресторант-пицария Централ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pizza-central.bg'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: '/',
    siteName: 'Ресторант-пицария Централ Добрич',
    title: 'Ресторант-пицария Централ Добрич',
    description: 'Ресторант-пицария Централ в Добрич предлага вкусна и здравословна храна, пица, основни ястия, обедни менюта и доставка до дома. Разполагаме с детски кът за вашите деца.',
    images: [
      {
        url: '/images/pizza-central-delivery.png',
        width: 1200,
        height: 630,
        alt: 'Ресторант-пицария Централ Добрич',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ресторант-пицария Централ Добрич',
    description: 'Ресторант-пицария Централ в Добрич предлага вкусна и здравословна храна, пица, основни ястия, обедни менюта и доставка до дома. Разполагаме с детски кът за вашите деца.',
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
    icon: '/images/favicon.ico',
    apple: '/images/apple-touch-icon.png',
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
              <Header />
              {children}
              <Footer />
              <ToastContainer />
            </ProductsProvider>
          </CategoriesProvider>
        </UserProvider>
      </body>
    </html>
  );
}
