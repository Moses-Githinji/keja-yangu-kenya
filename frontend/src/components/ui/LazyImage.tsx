import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder = "/placeholder-property.jpg",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading the actual image
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setCurrentSrc(src);
              setIsLoaded(true);
            };
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px", // Load slightly before it enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          isLoaded ? "opacity-100 scale-100" : "opacity-30 blur-sm scale-110",
          className
        )}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 backdrop-blur-sm animate-pulse">
           {/* Optional: Add a small loading spinner or icon here */}
        </div>
      )}
    </div>
  );
};

export default LazyImage;
