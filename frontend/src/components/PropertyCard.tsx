import { useState } from "react";
import { Link } from "react-router-dom";
import { Bed, Bath, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    currency: string;
    bedrooms?: number;
    bathrooms?: number;
    areaSize: number;
    areaUnit: string;
    images: PropertyImage[];
    address: string;
    propertyType: string;
    city?: string;
    county?: string;
  };
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = property.images && property.images.length > 0 
    ? property.images 
    : [{ url: '/placeholder-property.jpg', altText: property.title }];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="group overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={images[currentImageIndex]?.url || '/placeholder-property.jpg'}
            alt={images[currentImageIndex]?.altText || property.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-property.jpg';
            }}
          />
          
          {/* Image Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white">
                {currentImageIndex + 1}/{images.length}
              </div>
            </>
          )}

          <div className="absolute bottom-2 left-2 rounded bg-primary/90 px-2 py-1 text-xs font-medium text-white">
            {property.propertyType}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="mb-1 text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
          <p className="mb-3 text-sm text-muted-foreground line-clamp-1">
            {[property.address, property.city, property.county].filter(Boolean).join(', ')}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {property.bedrooms !== undefined && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Bed className="mr-1 h-4 w-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Bath className="mr-1 h-4 w-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Square className="mr-1 h-4 w-4" />
                <span>
                  {typeof property.areaSize === 'number' ? property.areaSize.toLocaleString() : property.areaSize} {property.areaUnit}
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold text-primary">
              {property.currency} {property.price.toLocaleString()}
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            View Details
          </Button>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
