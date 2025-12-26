import { Heart, MapPin, Bed, Bath, Square, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-container";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropertyModal from "./PropertyModal";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  priceType: "sale" | "rent";
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  rating: number;
  isLuxury?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  isPaid?: boolean;
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  priceType,
  image,
  bedrooms,
  bathrooms,
  area,
  rating,
  isLuxury = false,
  isFeatured = false,
  isVerified = false,
  isPaid = false,
}: PropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const handleCardClick = () => {
    navigate(`/property/${id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (!isLiked) {
      showSuccess("Added to favorites", "Property saved to your wishlist");
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const propertyData = {
    id,
    title,
    location,
    price,
    priceType,
    image,
    bedrooms,
    bathrooms,
    area,
    rating,
    isLuxury,
    isFeatured,
    isVerified,
    isPaid,
  };

  return (
    <>
      <Card
        className="property-card group cursor-pointer animate-property-hover"
        onClick={handleCardClick}
      >
        <div className="relative overflow-hidden">
          {/* Property Image */}
          <div className="aspect-[4/3] relative">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="property-overlay absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isFeatured && (
              <Badge className="bg-secondary text-secondary-foreground">
                Featured
              </Badge>
            )}
            {isLuxury && (
              <Badge className="luxury-gradient text-luxury-foreground">
                Luxury
              </Badge>
            )}
            {isVerified && (
              <Badge className="bg-green-500 text-green-50">Verified</Badge>
            )}
            {isPaid && <Badge className="bg-blue-500 text-blue-50">Paid</Badge>}
          </div>

          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white ${
              isLiked ? "text-red-500" : "text-gray-600"
            }`}
            onClick={handleLikeClick}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          </Button>

          {/* Quick View Button */}
          <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <Button
              className="w-full bg-white text-primary hover:bg-white/90"
              onClick={handleQuickViewClick}
            >
              Quick View
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl font-bold text-primary">
              KSh {price}
              {priceType === "rent" && (
                <span className="text-sm text-muted-foreground">/month</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-1">
            {title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-muted-foreground mb-4">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{location}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{bathrooms} bath</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{area} m²</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Modal */}
      <PropertyModal
        property={propertyData}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default PropertyCard;
