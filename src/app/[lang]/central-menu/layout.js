const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pizza-central.bg';

// Translations for metadata
const metadataTranslations = {
  bg: {
    title: 'Меню на Ресторант-пицария Централ град Добрич',
    description: 'Разгледайте нашето меню с вкусни пици, основни ястия, салати, гарнитури и десерти. Ресторант-пицария Централ в Добрич предлага автентична италианска пица и традиционна българска кухня.',
  },
  en: {
    title: 'Menu of Restaurant-Pizzeria Central, Dobrich',
    description: 'Browse our menu with delicious pizzas, main dishes, salads, side dishes and desserts. Restaurant-Pizzeria Central in Dobrich offers authentic Italian pizza and traditional Bulgarian cuisine.',
  },
  ro: {
    title: 'Meniul Restaurantului-Pizzeriei Central, Dobrich',
    description: 'Explorați meniul nostru cu pizza delicioase, feluri principale, salate, garnituri și deserturi. Restaurant-Pizzeria Central din Dobrich oferă pizza autentică italiană și bucătărie tradițională bulgară.',
  },
  de: {
    title: 'Menü des Restaurants & Pizzeria Central, Dobritsch',
    description: 'Durchstöbern Sie unser Menü mit köstlichen Pizzen, Hauptgerichten, Salaten, Beilagen und Desserts. Restaurant & Pizzeria Central in Dobritsch bietet authentische italienische Pizza und traditionelle bulgarische Küche.',
  },
};

// Language to locale mapping
const langToLocale = {
  bg: 'bg_BG',
  en: 'en_US',
  ro: 'ro_RO',
  de: 'de_DE',
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'bg';
  const meta = metadataTranslations[lang] || metadataTranslations.bg;
  const locale = langToLocale[lang] || 'bg_BG';
  
  const title = `${meta.title} | Ресторант-пицария Централ Добрич`;
  const url = lang === 'bg' ? `${baseUrl}/central-menu` : `${baseUrl}/${lang}/central-menu`;
  
  // Generate alternate languages (hreflang tags for SEO)
  const languages = ['bg', 'en', 'ro', 'de'];
  const alternates = {
    canonical: url,
    languages: {},
  };
  
  languages.forEach(l => {
    if (l === 'bg') {
      alternates.languages['bg'] = `${baseUrl}/central-menu`;
      alternates.languages['x-default'] = `${baseUrl}/central-menu`;
    } else {
      alternates.languages[l] = `${baseUrl}/${l}/central-menu`;
    }
  });

  return {
    title,
    description: meta.description,
    alternates,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: 'Ресторант-пицария Централ Добрич',
      locale,
      type: 'website',
      images: [
        {
          url: '/images/pizza-central-delivery.png',
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
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
  };
}

export default function CentralMenuLayout({ children }) {
  return children;
}

