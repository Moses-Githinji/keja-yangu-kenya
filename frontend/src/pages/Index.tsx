import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import PropertySection from "@/components/properties/PropertySection";
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
        <PropertySection 
          title="Featured Properties" 
          subtitle="Discover our handpicked selection of premium properties" 
          type="featured" 
        />
        <PropertySection 
          title="Verified Properties" 
          subtitle="Browse properties that have been verified by our agents" 
          type="verified" 
          bgColor="bg-white"
        />
        <MarketTrendsSection />
        <FeaturesSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
