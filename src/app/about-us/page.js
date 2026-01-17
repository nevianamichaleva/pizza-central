'use client';

import AboutSection from '@/components/AboutSection';
import Gallery from '@/components/Gallery';
import ServicesSection from '@/components/ServicesSection';
// import StatsSection from '@/components/StatsSection';

const AboutUsPage = () => {
  return (
    <div>
      <AboutSection />
      <ServicesSection />
      {/* <StatsSection /> */}
      <Gallery />
    </div>
  );
};

export default AboutUsPage;

