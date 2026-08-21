'use client';

import AboutSection from '@/components/AboutSection';
import Gallery from '@/components/Gallery';
import NewDishes from '@/components/NewDishes';
import ServicesSection from '@/components/ServicesSection';
// import StatsSection from '@/components/StatsSection';
import WhyUsSection from '@/components/WhyUsSection';

const AboutUsPage = () => {
  return (
    <div>
      <AboutSection />
      <Gallery />
      <WhyUsSection />
      <NewDishes />
      <ServicesSection />
      
      
      
      {/* <StatsSection /> */}
      
    </div>
  );
};

export default AboutUsPage;

