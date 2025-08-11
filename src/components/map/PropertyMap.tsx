import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  }>;
}

const PropertyMap = ({ 
  className = "", 
  center = [36.8219, -1.2921], // Nairobi coordinates
  zoom = 10,
  properties = []
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Note: Replace with actual Mapbox token
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add property markers
    properties.forEach((property) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <h3 class="font-semibold">${property.title}</h3>
          <p class="text-sm text-gray-600">KSh ${property.price}</p>
        </div>`
      );

      const marker = new mapboxgl.Marker({
        color: '#22c55e', // Using primary green color
      })
        .setLngLat([property.longitude, property.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [center, zoom, properties]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Placeholder for development - replace with actual map */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg bg-muted flex items-center justify-center"
      >
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Interactive Map
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Mapbox integration will be displayed here once configured with your API key
          </p>
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-primary font-medium">
              📍 Showing properties in Nairobi, Kenya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;