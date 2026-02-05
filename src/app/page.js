'use client';
// import AboutSection from '@/components/AboutSection';
import BlogSection from '@/components/BlogSection';
// import BookTableSection from '@/components/BookTableSection';
// import CateringSection from '@/components/CateringSection';
import Contact from '@/components/Contact';
// import EventsSection from '@/components/EventsSection';
import Gallery from '@/components/Gallery';
import Hero from '@/components/Hero';
// import MenuSection from '@/components/MenuSection';
import MenuPreview from '@/components/MenuPreview';
// import Chefs from '@/components/NewDishes';
import ServicesSection from '@/components/ServicesSection';
// import StatsSection from '@/components/StatsSection';
// import Testimonials from '@/components/Testimonials';
import WhyUsSection from '@/components/WhyUsSection';

export default function Home() {

  return (
    <div>
      <Hero />
      <MenuPreview />
      <ServicesSection />
      {/* <MenuSection /> */}
      {/* <CateringSection /> */}
      {/* <BookTableSection /> */}
      {/* <AboutSection />*/}
      {/* <BlogSection />*/}
      
      {/* <StatsSection /> */}
      <WhyUsSection /> 
      {/* <Testimonials /> */}
      {/* <EventsSection />
      <Chefs /> */}
      
      <Contact part={true}/>
      <BlogSection />
      <Gallery />
    </div>
  );
}