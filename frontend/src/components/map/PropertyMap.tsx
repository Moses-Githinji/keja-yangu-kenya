import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ChevronLeft, ChevronRight, X, Eye } from "lucide-react";

interface PropertyMapProps {
  className?: string;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  properties?: Array<{
    id: string;
    longitude: number;
    latitude: number;
    title: string;
    price: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    images?: string[];
    amenities?: string[];
    rating?: number;
  }>;
  onPinClick?: (propertyId: string) => void;
  onQuickView?: (propertyId: string) => void;
  selectedPropertyId?: string | null;
  showMapToggle?: boolean;
}

const PropertyMap = ({
  className = "",
  center = [36.8219, -1.2921], // Nairobi coordinates
  zoom = 10,
  properties = [],
  onPinClick,
  onQuickView,
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

  // Function to create markers
  const createMarkers = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add property markers
    properties.forEach((property) => {
      const isSelected = selectedPropertyId === property.id;

      // Create custom marker element
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg 
                      flex items-center justify-center ${
                        isSelected ? "bg-blue-500 scale-125" : "bg-green-500"
                      }">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
          ${
            isSelected
              ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>'
              : ""
          }
        </div>
      `;

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      // Store marker reference for later manipulation
      markersRef.current.set(property.id, marker);

      // Add click event to marker
      marker.getElement().addEventListener("click", () => {
        setSelectedProperty(property);
        setCurrentImageIndex(0);

        // Remove existing popup
        if (popupRef.current) {
          popupRef.current.remove();
        }

        // Create and show Mapbox popup with dynamic positioning
        const popupContent = createPopupContent(property);
        const { anchor, offset } = calculateOptimalPopupPosition(property);

        popupRef.current = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          maxWidth: "220px",
          offset: offset,
          className: "custom-popup",
          anchor: anchor,
        })
          .setLngLat([property.longitude, property.latitude])
          .setDOMContent(popupContent)
          .addTo(map.current!);

        if (onPinClick) {
          onPinClick(property.id);
        }
      });
    });
  };

  // Function to change map style
  const changeMapStyle = (style: "light" | "dark" | "satellite") => {
    if (!map.current) return;

    const styleUrls = {
      light: "mapbox://styles/mapbox/light-v11",
      dark: "mapbox://styles/mapbox/dark-v11",
      satellite: "mapbox://styles/mapbox/satellite-v9",
    };

    map.current.setStyle(styleUrls[style]);
    setMapStyle(style);
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
  const createPopupContent = (property: any) => {
    const popupDiv = document.createElement("div");
    popupDiv.className = "p-0";

    // Image Carousel
    if (property.images && property.images.length > 0) {
      const carouselDiv = document.createElement("div");
      carouselDiv.className = "relative";

      const img = document.createElement("img");
      img.src = property.images[currentImageIndex];
      img.alt = `${property.title} - Image ${currentImageIndex + 1}`;
      img.className = "w-full h-32 object-cover rounded-t-lg";

      // Quick View Button Overlay
      const overlayDiv = document.createElement("div");
      overlayDiv.className =
        "absolute inset-0 bg-black/20 flex items-center justify-center";

      const quickViewBtn = document.createElement("button");
      quickViewBtn.className =
        "bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg";
      quickViewBtn.innerHTML = `
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
        <span class="text-sm font-medium">Quick View</span>
      `;

      quickViewBtn.addEventListener("click", () => {
        if (onQuickView) {
          onQuickView(property.id);
        }
        if (popupRef.current) {
          popupRef.current.remove();
        }
      });

      overlayDiv.appendChild(quickViewBtn);
      carouselDiv.appendChild(img);
      carouselDiv.appendChild(overlayDiv);

      // Carousel Navigation (if multiple images)
      if (property.images.length > 1) {
        const navDiv = document.createElement("div");
        navDiv.className =
          "absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1";

        property.images.forEach((_, index) => {
          const dot = document.createElement("button");
          dot.className = `w-2 h-2 rounded-full transition-colors ${
            index === currentImageIndex ? "bg-white" : "bg-white/50"
          }`;
          dot.addEventListener("click", () => setCurrentImageIndex(index));
          navDiv.appendChild(dot);
        });

        carouselDiv.appendChild(navDiv);
      }

      popupDiv.appendChild(carouselDiv);
    }

    // Property Info Header
    const infoDiv = document.createElement("div");
    infoDiv.className = "p-2 bg-gray-50 rounded-b-lg";

    const title = document.createElement("h3");
    title.className = "font-medium text-gray-800 text-xs line-clamp-1 mb-1";
    title.textContent = property.title;

    const detailsDiv = document.createElement("div");
    detailsDiv.className = "flex items-center justify-between";

    const price = document.createElement("div");
    price.className = "text-sm font-bold text-green-600";
    price.textContent = property.price;

    const type = document.createElement("span");
    type.className =
      "text-xs text-gray-500 capitalize bg-white px-2 py-1 rounded-full border";
    type.textContent = property.propertyType || "Property";

    detailsDiv.appendChild(price);
    detailsDiv.appendChild(type);
    infoDiv.appendChild(title);
    infoDiv.appendChild(detailsDiv);
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

  // Handle quick view
  const handleQuickView = () => {
    if (onQuickView && selectedProperty) {
      onQuickView(selectedProperty.id);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Get Mapbox access token from environment
    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    if (!accessToken || accessToken === "YOUR_MAPBOX_ACCESS_TOKEN_HERE") {
      console.warn(
        "Mapbox access token not configured. Please set VITE_MAPBOX_ACCESS_TOKEN in your environment variables."
      );
      return;
    }

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: center,
      zoom: zoom,
      minZoom: 5,
      maxZoom: 18,
      attributionControl: true,
      customAttribution: "© Keja Yangu Kenya",
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
      "top-right"
    );

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-left"
    );

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Wait for map to load before adding markers
    map.current.on("load", () => {
      setIsMapLoaded(true);
      createMarkers();
    });

    // Handle map style changes
    map.current.on("styledata", () => {
      if (map.current && map.current.isStyleLoaded()) {
        createMarkers();
      }
    });

    // Handle map movement to update popup position
    map.current.on("move", () => {
      if (popupRef.current && selectedProperty) {
        // Update popup position to stay relative to the pin
        popupRef.current.setLngLat([
          selectedProperty.longitude,
          selectedProperty.latitude,
        ]);
      }
    });

    // Handle zoom changes to update popup position
    map.current.on("zoom", () => {
      if (popupRef.current && selectedProperty) {
        // Update popup position to stay relative to the pin
        popupRef.current.setLngLat([
          selectedProperty.longitude,
          selectedProperty.latitude,
        ]);
      }
    });

    // Cleanup
    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
      map.current?.remove();
      markersRef.current.clear();
    };
  }, [center, zoom, accessToken]);

  // Update markers when properties change (for filtering)
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && isMapLoaded) {
      createMarkers();
    }
  }, [properties, isMapLoaded]);

  // Update selected property when selectedPropertyId changes
  useEffect(() => {
    if (selectedPropertyId) {
      const property = properties.find((p) => p.id === selectedPropertyId);
      if (property) {
        setSelectedProperty(property);
        setCurrentImageIndex(0);
      }
    } else {
      setSelectedProperty(null);
      setCurrentImageIndex(0);
    }
  }, [selectedPropertyId, properties]);

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

      {/* Property Count Badge */}
      {properties.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg px-3 py-2">
            <div className="text-sm font-medium text-gray-700">
              📍 {properties.length} Properties
            </div>
            {selectedPropertyId && (
              <div className="text-xs text-blue-600 font-medium">
                🎯 Selected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Property Popup - Positioned Above Pin */}
      {selectedProperty && (
        <div
          className="absolute z-20"
          style={{
            left: `${
              map.current
                ? map.current.project([
                    selectedProperty.longitude,
                    selectedProperty.latitude,
                  ])[0] - 110
                : 0
            }px`,
            top: `${
              map.current
                ? map.current.project([
                    selectedProperty.longitude,
                    selectedProperty.latitude,
                  ])[1] - 220
                : 0
            }px`,
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border max-w-[220px]">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-1 right-1 z-30 bg-white/90 backdrop-blur-sm rounded-full p-0.5 hover:bg-white transition-colors"
            >
              <X className="h-3 w-3 text-gray-600" />
            </button>

            {/* Image Carousel with Overlaid Quick View Button */}
            {selectedProperty.images && selectedProperty.images.length > 0 && (
              <div className="relative">
                <div className="aspect-[4/3] rounded-t-lg overflow-hidden">
                  <img
                    src={selectedProperty.images[currentImageIndex]}
                    alt={`${selectedProperty.title} - Image ${
                      currentImageIndex + 1
                    }`}
                    className="w-full h-full object-cover"
                  />

                  {/* Quick View Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button
                      onClick={handleQuickView}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg backdrop-blur-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">Quick View</span>
                    </button>
                  </div>

                  {/* Carousel Navigation */}
                  {selectedProperty.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-0.5 hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="h-3 w-3 text-gray-600" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-0.5 hover:bg-white transition-colors"
                      >
                        <ChevronRight className="h-3 w-3 text-gray-600" />
                      </button>
                    </>
                  )}
                </div>

                {/* Image Indicators */}
                {selectedProperty.images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {selectedProperty.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Property Info Header */}
            <div className="p-2 border-t bg-gray-50 rounded-b-lg">
              <h3 className="font-medium text-gray-800 text-xs line-clamp-1 mb-1">
                {selectedProperty.title}
              </h3>
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-green-600">
                  {selectedProperty.price}
                </div>
                <span className="text-xs text-gray-500 capitalize bg-white px-2 py-1 rounded-full border">
                  {selectedProperty.propertyType || "Property"}
                </span>
              </div>
            </div>

            {/* Pin Pointer */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
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
