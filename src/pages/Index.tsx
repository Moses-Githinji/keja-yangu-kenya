import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import PropertyGrid from "@/components/properties/PropertyGrid";
import FeaturesSection from "@/components/features/FeaturesSection";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PropertyGrid />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
