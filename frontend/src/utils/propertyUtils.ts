/**
 * Normalizes the listing type to ensure consistent casing
 * @param type - The listing type to normalize
 * @returns Normalized listing type (SALE, RENT, or SHORT_TERM_RENT)
 * @throws Error if the input type is invalid
 */
export const normalizeListingType = (type: string): "SALE" | "RENT" | "SHORT_TERM_RENT" => {
  const normalized = type.toUpperCase();
  if (normalized !== 'SALE' && normalized !== 'RENT' && normalized !== 'BOTH' && normalized !== 'SHORT_TERM_RENT') {
    console.warn(`Invalid listing type: ${type}. Defaulting to 'SALE'`);
    return 'SALE';
  }
  if (normalized === 'BOTH') return 'SALE'; // Handle BOTH case
  return normalized as "SALE" | "RENT" | "SHORT_TERM_RENT";
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
    case 'SHORT_TERM_RENT':
      return 'Brief Stay';
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
export const isListingType = (value: unknown): value is "SALE" | "RENT" | "BOTH" | "SHORT_TERM_RENT" => {
  return (
    value === 'SALE' ||
    value === 'RENT' ||
    value === 'BOTH' ||
    value === 'SHORT_TERM_RENT'
  );
};
