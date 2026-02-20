export interface PropertyImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

export interface PropertyAgent {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  company?: string;
  bio?: string;
  licenseNumber?: string;
}

export interface PropertyFeature {
  id: string;
  name: string;
  value: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  status: string;
  address: string;
  city: string;
  county: string;
  neighborhood?: string;
  postalCode?: string;
  price: number;
  currency: string;
  priceType: string;
  rentPeriod?: string;
  deposit?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSize: number;
  areaUnit: string;
  yearBuilt?: number;
  floors?: number;
  parkingSpaces?: number;
  features: string[];
  amenities: string[];
  nearbyAmenities: string[];
  isFeatured?: boolean;
  rating?: number;
  isVerified: boolean;
  isPremium: boolean;
  slug: string;
  views: number;
  inquiryCount: number;
  images: PropertyImage[];
  agent: PropertyAgent | null;
  latitude?: number;
  longitude?: number;
  map?: string | string[];
  featuresList?: PropertyFeature[];
  formattedPrice?: string;
  location?: string;
  formattedArea?: string;
}
