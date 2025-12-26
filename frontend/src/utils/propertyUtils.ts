/**
 * Normalizes the listing type to ensure consistent casing
 * @param type - The listing type to normalize
 * @returns Normalized listing type (SALE or RENT)
 * @throws Error if the input type is invalid
 */
export const normalizeListingType = (type: string): "SALE" | "RENT" => {
  const normalized = type.toUpperCase();
  if (normalized !== 'SALE' && normalized !== 'RENT' && normalized !== 'BOTH') {
    console.warn(`Invalid listing type: ${type}. Defaulting to 'SALE'`);
    return 'SALE';
  }
  return normalized as "SALE" | "RENT";
};

/**
 * Gets the display text for a listing type
 * @param type - The listing type (case-insensitive)
 * @returns Display text for the listing type
 */
export const getDisplayListingType = (type: string): string => {
  const normalized = type.toUpperCase();
  switch (normalized) {
    case 'SALE':
      return 'For Sale';
    case 'RENT':
      return 'For Rent';
    case 'BOTH':
      return 'For Sale or Rent';
    default:
      console.warn(`Unknown listing type: ${type}`);
      return type;
  }
};

/**
 * Type guard to check if a value is a valid listing type
 */
export const isListingType = (value: unknown): value is "SALE" | "RENT" | "BOTH" => {
  return typeof value === 'string' && ['SALE', 'RENT', 'BOTH'].includes(value.toUpperCase());
};
