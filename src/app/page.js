'use client';
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

export default function Home() {

  return (
    <div>
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