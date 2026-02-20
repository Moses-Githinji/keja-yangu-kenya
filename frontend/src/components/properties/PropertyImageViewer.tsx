import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  images: string[];
  onImageClick: (index: number) => void;
}

const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  const mainImage = images[0] || "/placeholder.jpg";
  const thumbnails = images.slice(1, 9); // Up to 8 thumbnails for 3x3 grid (but 3 rows, 3 columns = 9, but first is main)
  const moreCount = images.length - 9;

  return (
    <div className="grid grid-cols-2 gap-2 h-[400px]">
      {" "}
      {/* Adjust height as needed */}
      {/* Left: Main Image */}
      <div className="row-span-3 relative rounded-lg overflow-hidden">
        <img
          src={mainImage}
          alt="Main property image"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onImageClick(0)}
        />
      </div>
      {/* Right: 3x3 Thumbnail Grid */}
      <div className="grid grid-cols-3 gap-2 row-span-3">
        {thumbnails.map((img, index) => (
          <div key={index} className="relative rounded-lg overflow-hidden">
            <img
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onImageClick(index + 1)}
            />
            {index === thumbnails.length - 1 && moreCount > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                +{moreCount} more
              </div>
            )}
          </div>
        ))}
        {/* Fill empty thumbnails if less than 8 */}
        {Array.from({ length: 8 - thumbnails.length }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
};

interface ImageCarouselProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageCarousel = ({
  images,
  initialIndex,
  onClose,
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Image */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Carousel
          className="w-full max-w-5xl"
          opts={{ loop: true, startIndex: currentIndex }}
        >
          <CarouselContent>
            {images.map((img, index) => (
              <CarouselItem key={index}>
                <img
                  src={img}
                  alt={`Image ${index + 1}`}
                  className="max-h-[80vh] w-auto mx-auto rounded-lg object-contain"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>

      {/* Thumbnail Strip */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-2 justify-center">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-20 h-20 rounded-lg overflow-hidden flex-shrink-0",
                index === currentIndex && "ring-2 ring-white"
              )}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface PropertyImageViewerProps {
  images: string[];
}

const PropertyImageViewer = ({ images }: PropertyImageViewerProps) => {
  const [showCarousel, setShowCarousel] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setShowCarousel(true);
  };

  return (
    <>
      <ImageGrid images={images} onImageClick={handleImageClick} />

      {showCarousel && (
        <ImageCarousel
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setShowCarousel(false)}
        />
      )}
    </>
  );
};

export default PropertyImageViewer;
