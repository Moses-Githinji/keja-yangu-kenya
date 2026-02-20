import { Heart, MapPin, Bed, Bath, Square, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  rawPrice?: string;  // Added
  priceType: "sale" | "rent" | "short_term";
  images: string[];
  primaryImage?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit?: string;
  rating: number;
  isLuxury?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  isPaid?: boolean;
  address?: string;  // Added
  city?: string;     // Added
  county?: string;   // Added
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  priceType,
  images,
  primaryImage,
  bedrooms,
  bathrooms,
  area,
  areaUnit = "m²",
  rating,
  isLuxury = false,
  isFeatured = false,
  isVerified = false,
  isPaid = false,
}: PropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) {
      return;
    } else {
      navigate(`/property/${id}`);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    if (!isLiked) {
      toast({
        title: "Added to favorites",
        description: "Property saved to your wishlist",
      });
    }
  };

  const displayImages =
    images?.length > 0 ? images : [primaryImage || "/placeholder-property.jpg"];

  return (
    <Card
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      aria-label={`View property details: ${title}`}
      // onKeyDown={(e) => {
      //   if ((e.key === "Enter" || e.key === " ") && onClick) {
      //     e.preventDefault();
      //     navigate(`/property/${id}`);
      //   }
      // }}
    >
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {displayImages.map((imgUrl, index) => (
              <CarouselItem key={index}>
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={imgUrl}
                    alt={`${title} - Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {displayImages.length > 1 && (
            <>
              <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
              <CarouselNext className="right-4 opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
            </>
          )}

          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              {displayImages.length} photos
            </div>
          )}
        </Carousel>

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isFeatured && <Badge variant="secondary">Featured</Badge>}
          {isLuxury && (
            <Badge className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
              Luxury
            </Badge>
          )}
          {isVerified && (
            <Badge className="bg-green-600 text-white">Verified</Badge>
          )}
          {isPaid && <Badge className="bg-blue-600 text-white">Premium</Badge>}
        </div>

        {/* Like Button */}
        <button
          type="button"
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-red-500 transition-colors p-2 rounded-full"
          onClick={handleLikeClick}
          aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>
      </div>

      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-3">
          <div className="text-2xl font-bold text-primary">
            KSh {price}
            {priceType === "rent" && (
              <span className="text-base font-normal text-muted-foreground">
                /mo
              </span>
            )}
            {priceType === "short_term" && (
              <span className="text-base font-normal text-muted-foreground">
                /night
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm font-medium">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {rating.toFixed(1)}
          </div>
        </div>

        <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4" />
            <span>{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4" />
            <span>{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="h-4 w-4" />
            <span>
              {area} {areaUnit}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
