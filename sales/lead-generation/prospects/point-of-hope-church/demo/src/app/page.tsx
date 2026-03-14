import HeroSection from "@/components/sections/HeroSection";
import Navigation from "@/components/layout/Navigation";
import BodyWrapper from "@/components/layout/BodyWrapper";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import EventsSection from "@/components/sections/EventsSection";
import TeamSection from "@/components/sections/TeamSection";
import WhatToExpectSection from "@/components/sections/WhatToExpectSection";
import SocialSection from "@/components/sections/SocialSection";
import FindUsSection from "@/components/sections/FindUsSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <BodyWrapper>
      {/* Navigation appears after scrolling past hero */}
      <Navigation />

      {/* Hero -- standalone section with its own atmosphere */}
      <HeroSection />

      {/* Content sections */}
      <AboutSection />
      <ServicesSection />
      <EventsSection />
      <TeamSection />
      <WhatToExpectSection />
      <SocialSection />
      <FindUsSection />

      <Footer />
    </BodyWrapper>
  );
}
