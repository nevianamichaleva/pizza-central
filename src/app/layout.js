import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';
import '../../public/css/main.css';
import Footer from '../components/Footer';
import Header from '../components/Header';

import { CategoriesProvider } from '@/context/CategoriesContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { UserProvider } from '@/context/UserContext';

export const metadata = {
  title: "Ресторант-пицария Централ Добрич",
  description: "Вкусна и здравословна храна",
  icons: {
    icon: './images/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </head>

      <body className="index-page">
        <UserProvider>
          <CategoriesProvider>
            <ProductsProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <ToastContainer />
            </ProductsProvider>
          </CategoriesProvider>
        </UserProvider>
      </body>
    </html>
  );
}
