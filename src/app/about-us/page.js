'use client';

import AboutSection from '@/components/AboutSection';
import Gallery from '@/components/Gallery';
import NewDishes from '@/components/NewDishes';
import ServicesSection from '@/components/ServicesSection';
// import StatsSection from '@/components/StatsSection';

const AboutUsPage = () => {
  return (
    <div>
      <AboutSection />
      
      <ServicesSection />
      <NewDishes />
      {/* <StatsSection /> */}
      <Gallery />
    </div>
  );
};

export default AboutUsPage;

