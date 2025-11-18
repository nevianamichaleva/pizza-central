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
import StructuredData from '@/components/StructuredData';

export const metadata = {
  title: {
    default: "Ресторант-пицария Централ Добрич",
    template: "%s | Ресторант-пицария Централ Добрич"
  },
  description: "Ресторант-пицария Централ в Добрич предлага вкусна и здравословна храна, пица, основни ястия, обедни менюта и доставка до дома. Резервирайте маса или поръчайте онлайн.",
  keywords: ["ресторант Добрич", "пицария Добрич", "доставка храна Добрич", "обедно меню Добрич", "резервация ресторант", "пица Добрич", "ястия Добрич"],
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
    description: 'Ресторант-пицария Централ в Добрич предлага вкусна и здравословна храна, пица, основни ястия, обедни менюта и доставка до дома.',
    images: [
      {
        url: '/images/hero-img.png',
        width: 1200,
        height: 630,
        alt: 'Ресторант-пицария Централ Добрич',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ресторант-пицария Централ Добрич',
    description: 'Ресторант-пицария Централ в Добрич предлага вкусна и здравословна храна, пица, основни ястия, обедни менюта и доставка до дома.',
    images: ['/images/hero-img.png'],
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
    // Добавете вашите verification кодове тук, ако имате
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({ children }) {
  const restaurantStructuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Ресторант-пицария Централ",
    "image": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/images/hero-img.png` : "https://pizza-central.bg/images/hero-img.png",
    "@id": process.env.NEXT_PUBLIC_SITE_URL || "https://pizza-central.bg",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://pizza-central.bg",
    "telephone": "+359-XXX-XXX-XXX", // Добавете вашия телефон
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "", // Добавете адреса
      "addressLocality": "Добрич",
      "addressCountry": "BG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "", // Добавете координати
      "longitude": "" // Добавете координати
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "10:00",
        "closes": "22:00"
      }
    ],
    "servesCuisine": ["Italian", "Bulgarian", "Pizza"],
    "menu": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/our-menu` : "https://pizza-central.bg/our-menu",
    "acceptsReservations": "True",
    "hasMenu": {
      "@type": "Menu",
      "hasMenuSection": {
        "@type": "MenuSection",
        "name": "Меню",
        "url": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/our-menu` : "https://pizza-central.bg/our-menu"
      }
    }
  };

  return (
    <html lang="bg">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <StructuredData data={restaurantStructuredData} />
      </head>

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
