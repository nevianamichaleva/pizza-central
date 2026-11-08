const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

export const metadata = {
  title: 'За нас',
  description: 'Ресторант-пицария Централ в Добрич вече 18 години предлага вкусна храна, автентични италиански пици, българска скара и уютна семейна обстановка с детски кът.',
  alternates: {
    canonical: `${baseUrl}/about-us`,
  },
};

export default function AboutUsLayout({ children }) {
  return children;
}

