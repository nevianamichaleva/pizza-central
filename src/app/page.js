// import AboutSection from '@/components/AboutSection';
import BlogSection from '@/components/BlogSection';
// import BookTableSection from '@/components/BookTableSection';
import CateringSection from '@/components/CateringSection';
import Contact from '@/components/Contact';
// import EventsSection from '@/components/EventsSection';
import Gallery from '@/components/Gallery';
// import Hero from '@/components/Hero';
import ModernHero from '@/components/ModernHero';
// import MenuSection from '@/components/MenuSection';
import MenuPreview from '@/components/MenuPreview';
// import Chefs from '@/components/NewDishes';
// import StatsSection from '@/components/StatsSection';
// import Testimonials from '@/components/Testimonials';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

export const revalidate = 300;

export const metadata = {
  alternates: {
    canonical: baseUrl,
  },
};

const restaurantJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  '@id': `${baseUrl}/#restaurant`,
  name: 'Ресторант-пицария Централ',
  url: baseUrl,
  image: `${baseUrl}/images/pizza-central-delivery.png`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Независимост 4',
    addressLocality: 'Добрич',
    postalCode: '9300',
    addressCountry: 'BG',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 43.56913,
    longitude: 27.82433,
  },
  telephone: ['+359895516401', '+359893315201'],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '22:00',
    },
  ],
  hasMenu: `${baseUrl}/central-menu`,
  sameAs: [
    'https://www.facebook.com/CentralDobrich',
    'https://www.google.com/maps?cid=14317414988468753192',
  ],
};

export default function Home() {

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
      {/* <Hero /> */}
      <ModernHero />
      <MenuPreview />
      <CateringSection />
      <BlogSection />
      {/* <ServicesSection /> */}
      {/* <MenuSection /> */}
      
      {/* <BookTableSection /> */}
      {/* <AboutSection />*/}
      {/* <BlogSection />*/}
      
      {/* <StatsSection /> */}
      {/* <WhyUsSection />  */}
      {/* <Testimonials /> */}
      {/* <EventsSection />
      <Chefs /> */}
      
      <Contact part={true}/>
      
      <Gallery />
    </div>
  );
}