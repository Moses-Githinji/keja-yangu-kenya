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

    // Note: Add your Mapbox public token to Supabase Edge Function Secrets
    // For now, using placeholder - get your token from https://mapbox.com/
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';
    
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
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Overlay for when Mapbox token is not configured */}
      {(!import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') && (
        <div className="absolute inset-0 bg-muted/90 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center p-8 bg-background/80 rounded-lg border">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-4">
              Configure your Mapbox API key to see the interactive map
            </p>
            <div className="space-y-2 text-xs">
              <p className="font-medium text-primary">Setup Instructions:</p>
              <p>1. Get your token from <span className="font-mono bg-muted px-1">mapbox.com</span></p>
              <p>2. Add to Supabase Edge Function Secrets</p>
              <p>3. Or set <span className="font-mono bg-muted px-1">VITE_MAPBOX_TOKEN</span></p>
            </div>
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-primary font-medium">
                📍 {properties.length} properties in Nairobi
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;