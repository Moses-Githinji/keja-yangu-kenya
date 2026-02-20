// components/ImageCarousel.tsx
import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: Array<{ id: string; url: string; altText?: string }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onIndexChange?: (index: number) => void;
}

const ImageCarousel = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onIndexChange,
}: ImageCarouselProps) => {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  if (!images.length) return null;

  const handleThumbnailClick = (index: number) => {
    if (onIndexChange) {
      onIndexChange(index);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-50 text-white hover:text-gray-300 transition-colors"
        aria-label="Close gallery"
      >
        <X size={32} />
      </button>

      {/* Navigation buttons */}
      <button
        onClick={onPrevious}
        className="absolute left-4 z-50 p-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft size={40} />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 z-50 p-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Next image"
      >
        <ChevronRight size={40} />
      </button>

      {/* Main image */}
      <div className="relative h-full w-full max-w-4xl">
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].altText || "Property image"}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Thumbnails */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 p-4">
        {images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => handleThumbnailClick(index)}
            className={`h-16 w-16 overflow-hidden rounded border-2 transition-all ${
              index === currentIndex
                ? "border-white"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img src={img.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
