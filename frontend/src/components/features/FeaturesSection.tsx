import { 
  Search, 
  MapPin, 
  Shield, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Star, 
  Clock 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: "Advanced Search",
      description: "Find properties with precision using our intelligent search filters and location-based discovery."
    },
    {
      icon: MapPin,
      title: "Interactive Maps",
      description: "Explore neighborhoods with our detailed maps powered by real-time data and satellite imagery."
    },
    {
      icon: Shield,
      title: "Verified Listings",
      description: "All properties are verified by our team to ensure authenticity and accurate information."
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Connect instantly with property owners and agents through our integrated chat system."
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Get real-time market trends and property valuations to make informed decisions."
    },
    {
      icon: Users,
      title: "Expert Agents",
      description: "Work with certified real estate professionals who know the Kenyan market inside out."
    },
    {
      icon: Star,
      title: "Premium Service",
      description: "Experience white-glove service with personalized property recommendations and tours."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Our customer support team is available round the clock to assist with your needs."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-4">
            Why Choose KejaYangu?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing the Kenyan real estate market with cutting-edge technology 
            and unmatched service quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-[var(--shadow-elegant)] transition-all duration-300 animate-fade-in-up border-0 bg-card/50 backdrop-blur-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4">
              Ready to Find Your Dream Property?
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who found their perfect space with KejaYangu
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary-glow transition-colors font-medium">
                Start Searching
              </button>
              <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium">
                List Your Property
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;