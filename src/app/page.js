'use client';
import AboutSection from '@/components/AboutSection';
import BookTableSection from '@/components/BookTableSection';
import Contact from '@/components/Contact';
// import Gallery from '@/components/Gallery';
import Hero from '@/components/Hero';
import MenuSection from '@/components/MenuSection';
import Chefs from '@/components/NewDishes';
import StatsSection from '@/components/StatsSection';
import WhyUsSection from '@/components/WhyUsSection';

export default function Home() {

  return (
    <div>
      <Hero />
      <AboutSection />
      <WhyUsSection />
      <StatsSection />
      <MenuSection />
      {/* <Testimonials /> */}
      {/* <EventsSection /> */}
      <Chefs />
      <BookTableSection />
      {/* <Gallery /> */}
      <Contact />
    </div>
  );
}