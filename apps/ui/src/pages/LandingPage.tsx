import React, { useEffect } from 'react';
import LandingPageLayout from '../components/templates/landing/LandingPageLayout';
import HeroSection from '../components/organisms/landing/HeroSection';
import Feature from '../components/organisms/landing/Feature';
import UseRole from '../components/organisms/landing/UseRole';
import { disconnectSocket } from '../services/socketService';

const LandingPage: React.FC = () => {
  // Ensure socket is disconnected when landing on landing page
  useEffect(() => {
    console.log('🔌 LandingPage: Ensuring socket is disconnected');
    disconnectSocket();
  }, []);

  return (
    <LandingPageLayout>
      <HeroSection />
      <Feature />
      <UseRole />
    </LandingPageLayout>
  );
};

export default LandingPage;
