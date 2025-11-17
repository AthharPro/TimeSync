import React from 'react';
import LandingPageLayout from '../components/templates/landing/LandingPageLayout';
import HeroSection from '../components/organisms/landing/HeroSection';
import Feature from '../components/organisms/landing/Feature';
import UseRole from '../components/organisms/landing/UseRole';

const LandingPage: React.FC = () => {
  return (
    <LandingPageLayout>
      <HeroSection />
      <Feature />
      <UseRole />
    </LandingPageLayout>
  );
};

export default LandingPage;
