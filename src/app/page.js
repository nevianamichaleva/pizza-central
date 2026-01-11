'use client';
import AboutSection from '@/components/AboutSection';
import BlogSection from '@/components/BlogSection';
import BookTableSection from '@/components/BookTableSection';
import CateringSection from '@/components/CateringSection';
import Contact from '@/components/Contact';
// import EventsSection from '@/components/EventsSection';
import Gallery from '@/components/Gallery';
import Hero from '@/components/Hero';
import MenuSection from '@/components/MenuSection';
// import Chefs from '@/components/NewDishes';
import StatsSection from '@/components/StatsSection';
import WhyUsSection from '@/components/WhyUsSection';

export default function Home() {

  return (
    <div>
      <Hero />
      <MenuSection />
      <CateringSection />
      <BookTableSection />
      <AboutSection />
      <BlogSection />
      <WhyUsSection />
      <StatsSection />
      
      {/* <Testimonials /> */}
      {/* <EventsSection />
      <Chefs /> */}
      
      <Contact />
      <Gallery />
    </div>
  );
}