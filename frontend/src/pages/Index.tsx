import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import PropertyGrid from "@/components/properties/PropertyGrid";
import MarketTrendsSection from "@/components/home/MarketTrendsSection";
import FeaturesSection from "@/components/features/FeaturesSection";
import FAQSection from "@/components/home/FAQSection";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PropertyGrid />
        <MarketTrendsSection />
        <FeaturesSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
