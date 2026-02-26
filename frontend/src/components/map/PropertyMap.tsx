import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { Property } from "@/types/property";

interface PropertyMapProps {
  className?: string;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  properties?: Array<
    Partial<Property> & {
      // Required fields for the map
      id: string;
      longitude: number;
      latitude: number;
      title: string;
      price: number;
      // Other optional fields that might be used in the map popup
      propertyType?: string;
      bedrooms?: number;
      bathrooms?: number;
      areaSize?: number;
      areaUnit?: string;
      image?: string;
      images?: string[] | Array<{ url: string; [key: string]: any }>;
      listingType?: string;
      amenities?: string[];
      nearbyAmenities?: string[];
      rating?: number;
      address?: string;
      city?: string;
      slug?: string;
    }
  >;
  onPinClick?: (propertyId: string) => void;
  selectedPropertyId?: string | null;
  showMapToggle?: boolean;
}

const PropertyMap = ({
  className = "",
  center = [36.8219, -1.2921], // Nairobi coordinates
  zoom = 10,
  properties = [],
  onPinClick,
  selectedPropertyId,
  showMapToggle = false,
}: PropertyMapProps) => {
  // Get access token for display
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapStyle, setMapStyle] = useState<"light" | "dark" | "satellite">(
    "light"
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Constants
  const STYLE_URLS = {
    light: "mapbox://styles/mapbox/light-v11",
    dark: "mapbox://styles/mapbox/dark-v11",
    satellite: "mapbox://styles/mapbox/satellite-v9",
  };

  // Function to create markers
  const updateMarkers = React.useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add property markers
    properties.forEach((property) => {
      const isSelected = selectedPropertyId === property.id;

      // Create custom marker element
      const markerElement = document.createElement("div");
      markerElement.className = `custom-marker ${isSelected ? "z-10" : "z-0"}`;
      markerElement.innerHTML = `
        <div class="relative">
          <div class="w-7 h-7 rounded-full border-2 border-white shadow-xl 
                      flex items-center justify-center transition-all duration-300 ${
                        isSelected ? "bg-primary scale-125 ring-4 ring-primary/20" : "bg-green-600 hover:scale-110"
                      }">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      `;

      const lng = Number(property.longitude);
      const lat = Number(property.latitude);

      if (isNaN(lng) || isNaN(lat)) return;

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Store marker reference
      markersRef.current.set(property.id, marker);

      // Add click event to marker
      marker.getElement().addEventListener("click", () => {
        handlePropertySelection(property);
      });
    });
  }, [properties, selectedPropertyId, isMapLoaded]);

  const handlePropertySelection = (property: any) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);

    if (onPinClick) {
      onPinClick(property.id);
    }

    // Center map on the selected property smoothly
    if (map.current) {
      map.current.easeTo({
        center: [property.longitude, property.latitude],
        zoom: Math.max(map.current.getZoom(), 14),
        duration: 800,
        offset: [0, -50], // Slightly offset to account for the popup height
      });
    }

    // Show popup
    showPopup(property);
  };

  const showPopup = (property: any) => {
    // Remove existing popup
    if (popupRef.current) {
      popupRef.current.remove();
    }

    const { anchor, offset } = calculateOptimalPopupPosition(property);
    popupRef.current = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: "240px",
      offset: offset,
      className: "custom-popup",
      anchor: anchor,
    })
      .setLngLat([property.longitude, property.latitude])
      .setDOMContent(createPopupContent(property, 0))
      .addTo(map.current!);
  };

  // Function to change map style
  const changeMapStyle = (style: "light" | "dark" | "satellite") => {
    if (!map.current) return;
    map.current.setStyle(STYLE_URLS[style]);
    setMapStyle(style);
  };

  // Function to get image URL from either string or PropertyImage object
  const getImageUrl = (
    image: string | { url: string; [key: string]: any }
  ): string => {
    return typeof image === "string" ? image : image.url;
  };

  // Function to navigate carousel images
  const nextImage = () => {
    if (selectedProperty?.images && selectedProperty.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty?.images && selectedProperty.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  // Calculate optimal popup position based on pin location
  const calculateOptimalPopupPosition = (property: any) => {
    if (!map.current)
      return {
        anchor: "bottom" as const,
        offset: {
          top: [0, -5] as [number, number],
          bottom: [0, 10] as [number, number],
          left: [0, 0] as [number, number],
          right: [0, 0] as [number, number],
        },
      };

    const pinPoint = map.current.project([
      property.longitude,
      property.latitude,
    ]);
    const mapContainer = map.current.getContainer();
    const viewportWidth = mapContainer.offsetWidth;
    const viewportHeight = mapContainer.offsetHeight;

    // Calculate available space in each direction
    const spaceAbove = pinPoint[1];
    const spaceBelow = viewportHeight - pinPoint[1];
    const spaceLeft = pinPoint[0];
    const spaceRight = viewportWidth - pinPoint[0];

    // Determine optimal anchor and offset
    let anchor: "top" | "bottom" = "bottom";
    let offset = {
      top: [0, -5] as [number, number],
      bottom: [0, 10] as [number, number],
      left: [0, 0] as [number, number],
      right: [0, 0] as [number, number],
    };

    // If pin is near top of viewport, show popup below
    if (spaceAbove < 120) {
      anchor = "top";
      offset = {
        top: [0, 10] as [number, number],
        bottom: [0, -5] as [number, number],
        left: [0, 0] as [number, number],
        right: [0, 0] as [number, number],
      };
    }

    // If pin is near left edge, adjust horizontal offset
    if (spaceLeft < 110) {
      offset.left = [110 - spaceLeft, 0] as [number, number];
    }

    // If pin is near right edge, adjust horizontal offset
    if (spaceRight < 110) {
      offset.right = [110 - spaceRight, 0] as [number, number];
    }

    return { anchor, offset };
  };

  // Create popup content
  const createPopupContent = (property: any, imageIndex: number) => {
    const popupDiv = document.createElement("div");
    popupDiv.className = "flex flex-col w-[220px]";

    // Image Carousel
    if (property.images && property.images.length > 0) {
      const carouselDiv = document.createElement("div");
      carouselDiv.className = "relative group";

      const img = document.createElement("img");
      const imageUrl = getImageUrl(property.images[imageIndex]);
      img.src = imageUrl;
      img.alt = `${property.title} - Image ${imageIndex + 1}`;
      img.className = "w-full h-32 object-cover rounded-t-lg";
      carouselDiv.appendChild(img);

      // Carousel Navigation Arrows
      if (property.images.length > 1) {
        // Prev Button
        const prevBtn = document.createElement("button");
        prevBtn.className = "absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity";
        prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
        prevBtn.onclick = (e) => {
          e.stopPropagation();
          const nextIdx = imageIndex === 0 ? property.images.length - 1 : imageIndex - 1;
          setCurrentImageIndex(nextIdx);
          if (popupRef.current) {
            popupRef.current.setDOMContent(createPopupContent(property, nextIdx));
          }
        };
        carouselDiv.appendChild(prevBtn);

        // Next Button
        const nextBtn = document.createElement("button");
        nextBtn.className = "absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity";
        nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
        nextBtn.onclick = (e) => {
          e.stopPropagation();
          const nextIdx = imageIndex === property.images.length - 1 ? 0 : imageIndex + 1;
          setCurrentImageIndex(nextIdx);
          if (popupRef.current) {
            popupRef.current.setDOMContent(createPopupContent(property, nextIdx));
          }
        };
        carouselDiv.appendChild(nextBtn);

        // Counter
        const counter = document.createElement("div");
        counter.className = "absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded";
        counter.textContent = `${imageIndex + 1}/${property.images.length}`;
        carouselDiv.appendChild(counter);
      }

      popupDiv.appendChild(carouselDiv);
    }

    // Property Info
    const infoDiv = document.createElement("div");
    infoDiv.className = "p-3 bg-white rounded-b-lg border-t";

    const title = document.createElement("h3");
    title.className = "font-bold text-gray-900 text-[13px] line-clamp-1 mb-1.5";
    title.textContent = property.title;
    infoDiv.appendChild(title);

    const metaDiv = document.createElement("div");
    metaDiv.className = "flex items-center justify-between gap-2 mt-2";

    const price = document.createElement("div");
    price.className = "text-[14px] font-extrabold text-primary";
    price.textContent = typeof property.price === "number" 
      ? `KSh ${property.price.toLocaleString()}` 
      : property.price;
    metaDiv.appendChild(price);

    const type = document.createElement("span");
    type.className = "text-[10px] text-muted-foreground uppercase tracking-wider font-semibold bg-gray-100 px-1.5 py-0.5 rounded";
    type.textContent = property.propertyType || "Property";
    metaDiv.appendChild(type);

    infoDiv.appendChild(metaDiv);
    popupDiv.appendChild(infoDiv);

    return popupDiv;
  };

  // Close popup
  const closePopup = () => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    setSelectedProperty(null);
    setCurrentImageIndex(0);
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token || token === "YOUR_MAPBOX_ACCESS_TOKEN_HERE") return;

    mapboxgl.accessToken = token;

    const initializedMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: STYLE_URLS[mapStyle],
      center: center,
      zoom: zoom,
      minZoom: 5,
      maxZoom: 18,
      attributionControl: true,
      customAttribution: "© Keja Yangu Kenya",
    });

    map.current = initializedMap;

    initializedMap.addControl(new mapboxgl.NavigationControl(), "top-right");
    initializedMap.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-left"
    );
    initializedMap.addControl(new mapboxgl.FullscreenControl(), "top-right");

    initializedMap.on("load", () => {
      setIsMapLoaded(true);
    });

    initializedMap.on("styledata", () => {
      // Re-trigger marker updates when style changes
      if (initializedMap.isStyleLoaded()) {
        updateMarkers();
      }
    });

    return () => {
      if (popupRef.current) popupRef.current.remove();
      initializedMap.remove();
      map.current = null;
    };
  }, []); // Only run once on mount

  // Sync markers when properties or selection changes
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Initial fitBounds - only when data first arrives or drastically changes
  useEffect(() => {
    if (!map.current || !isMapLoaded || properties.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    let count = 0;
    properties.forEach((p) => {
      const lng = Number(p.longitude);
      const lat = Number(p.latitude);
      if (!isNaN(lng) && !isNaN(lat) && lng !== 0) {
        bounds.extend([lng, lat]);
        count++;
      }
    });

    if (count > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
        duration: 1000,
      });
    }
  }, [isMapLoaded, properties.length]); // Only fit bounds when the NUMBER of properties changes (e.g. after filtering)

  // Update markers when properties change (for filtering)
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && isMapLoaded) {
      updateMarkers();
    }
  }, [properties, isMapLoaded]);

  // Handle selection from outside (props)
  useEffect(() => {
    if (selectedPropertyId && isMapLoaded) {
      const property = properties.find((p) => p.id === selectedPropertyId);
      if (property) {
        handleExternalSelection(property);
      }
    } else if (!selectedPropertyId && popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  }, [selectedPropertyId, isMapLoaded]);

  const handleExternalSelection = (property: any) => {
    // Only center and show popup if it's not already the selected one in state
    // (To avoid jumping when clicking the pin itself)
    if (selectedProperty?.id !== property.id) {
      setSelectedProperty(property);
      setCurrentImageIndex(0);

      if (map.current) {
        map.current.easeTo({
          center: [property.longitude, property.latitude],
          zoom: Math.max(map.current.getZoom(), 14),
          duration: 800,
          offset: [0, -50],
        });
      }
      showPopup(property);
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Custom CSS for Mapbox Popup */}
      <style>{`
        .custom-popup .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid #e5e7eb !important;
        }
        .custom-popup .mapboxgl-popup-tip {
          border-top-color: #e5e7eb !important;
        }
        .custom-popup .mapboxgl-popup-close-button {
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 50% !important;
          width: 20px !important;
          height: 20px !important;
          font-size: 14px !important;
          line-height: 1 !important;
          padding: 0 !important;
          right: 8px !important;
          top: 8px !important;
          z-index: 10 !important;
        }
        .custom-popup .mapboxgl-popup-close-button:hover {
          background: white !important;
        }
      `}</style>

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Map Style Toggle */}
      {showMapToggle && isMapLoaded && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-1 flex flex-col space-y-1">
            <button
              onClick={() => changeMapStyle("light")}
              className={`p-2 rounded text-xs font-medium transition-colors ${
                mapStyle === "light"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => changeMapStyle("dark")}
              className={`p-2 rounded text-xs font-medium transition-colors ${
                mapStyle === "dark"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => changeMapStyle("satellite")}
              className={`p-2 rounded text-xs font-medium transition-colors ${
                mapStyle === "satellite"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      )}

      {/* Overlay for when Mapbox token is not configured */}
      {(!accessToken || accessToken === "YOUR_MAPBOX_ACCESS_TOKEN_HERE") && (
        <div className="absolute inset-0 bg-muted/90 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center p-8 bg-background/80 rounded-lg border max-w-md">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Configure your Mapbox API key to see the interactive map
            </p>
            <div className="space-y-2 text-xs text-left">
              <p className="font-medium text-primary">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Get your token from{" "}
                  <span className="font-mono bg-muted px-1">mapbox.com</span>
                </li>
                <li>
                  Create a <span className="font-mono bg-muted px-1">.env</span>{" "}
                  file in the frontend directory
                </li>
                <li>
                  Add:{" "}
                  <span className="font-mono bg-muted px-1">
                    VITE_MAPBOX_ACCESS_TOKEN=your_token_here
                  </span>
                </li>
                <li>Restart your development server</li>
              </ol>
            </div>
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-primary font-medium">
                📍 {properties.length} properties in Kenya
              </p>
            </div>
            {selectedPropertyId && (
              <div className="mt-3 p-2 bg-secondary/10 rounded-lg">
                <p className="text-xs text-secondary font-medium">
                  🎯 Property {selectedPropertyId} selected
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {accessToken &&
        accessToken !== "YOUR_MAPBOX_ACCESS_TOKEN_HERE" &&
        !isMapLoaded && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
    </div>
  );
};

export default PropertyMap;
