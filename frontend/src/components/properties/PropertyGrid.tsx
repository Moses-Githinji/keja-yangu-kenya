import PropertyCard from "./PropertyCard";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const PropertyGrid = () => {
  const properties = [
    {
      id: "1",
      title: "Luxury Villa with Ocean Views",
      location: "Nyali, Mombasa",
      price: "25,000,000",
      priceType: "sale" as const,
      image: property2,
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      rating: 4.8,
      isLuxury: true,
      isFeatured: true,
    },
    {
      id: "2",
      title: "Modern Apartment in Westlands",
      location: "Westlands, Nairobi",
      price: "180,000",
      priceType: "rent" as const,
      image: property1,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      rating: 4.6,
      isFeatured: true,
    },
    {
      id: "3",
      title: "Traditional Villa in Kisumu",
      location: "Milimani, Kisumu",
      price: "8,500,000",
      priceType: "sale" as const,
      image: property3,
      bedrooms: 5,
      bathrooms: 4,
      area: 280,
      rating: 4.7,
    },
    {
      id: "4",
      title: "Penthouse with City Views",
      location: "Upper Hill, Nairobi",
      price: "320,000",
      priceType: "rent" as const,
      image: property1,
      bedrooms: 4,
      bathrooms: 3,
      area: 200,
      rating: 4.9,
      isLuxury: true,
    },
    {
      id: "5",
      title: "Beachfront Apartment",
      location: "Diani, Mombasa",
      price: "15,000,000",
      priceType: "sale" as const,
      image: property2,
      bedrooms: 2,
      bathrooms: 2,
      area: 90,
      rating: 4.5,
    },
    {
      id: "6",
      title: "Family Home with Garden",
      location: "Karen, Nairobi",
      price: "220,000",
      priceType: "rent" as const,
      image: property3,
      bedrooms: 4,
      bathrooms: 3,
      area: 180,
      rating: 4.4,
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover handpicked properties that match your lifestyle and budget
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PropertyCard
                {...property}
                isVerified={Math.random() < 0.7} // 70% chance of being verified
                isPaid={Math.random() < 0.6} // 60% chance of being paid
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary-glow transition-colors font-medium">
            View All Properties
          </button>
        </div>
      </div>
    </section>
  );
};

export default PropertyGrid;
