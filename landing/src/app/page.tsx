import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ModulesSection } from '@/components/ModulesSection';
import { Footer } from '@/components/Footer';
import { ChatWidget } from '@/components/ChatWidget';

export default function LandingPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '/app';

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2C1810] flex flex-col justify-between selection:bg-[#C4956A]/20">
      <Navbar appUrl={appUrl} />
      <HeroSection appUrl={appUrl} />
      <ModulesSection />
      <Footer appUrl={appUrl} />
      <ChatWidget />
    </main>
  );
}
