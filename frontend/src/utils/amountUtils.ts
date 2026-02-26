/**
 * Utility for formatting property prices and numbers into compact forms
 */

/**
 * Extracts the first characters of each word in a string
 * @example "John Doe" -> "JD"
 */
export const firstChars = (value: string): string =>
  value
    .split(/\s/)
    .reduce((response, word) => (response += word.slice(0, 1)), "");

/**
 * Returns 's' if the value is plural, otherwise an empty string
 */
export const isMultiple = (value: number): string => (value === 0 || value > 1 ? "s" : "");

/**
 * Assigns a unit suffix based on value magnitude
 * @example 5000000 -> "M", 30000 -> "K"
 */
export const assignValue = (value: number): string =>
  value >= 1000000 ? "M" : value >= 1000 ? "K" : "";

/**
 * Reduces a value to its unit scale
 * @example 5000000 -> 5, 30000 -> 30
 */
export const simpleForm = (value: number): number => {
  if (value >= 1000000) return value / 1000000;
  if (value >= 1000) return value / 1000;
  return value;
};

/**
 * Formats a property price into a neat compact form
 * @example 
 * 5000000, SALE -> "Ksh 5M"
 * 30000, RENT -> "Ksh 30K/month"
 * 2500, SHORT_TERM_RENT -> "Ksh 2.5K/night"
 */
export const formatCompactPrice = (price: number, listingType?: string): string => {
  const value = simpleForm(price);
  const suffix = assignValue(price);
  const unit = suffix;
  
  // Format the number part (handle decimals nicely)
  const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed(1);
  const basePrice = `Ksh ${formattedValue}${unit}`;

  if (!listingType) return basePrice;

  const type = listingType.toUpperCase();
  if (type === "RENT") return `${basePrice}/month`;
  if (type === "SHORT_TERM_RENT") return `${basePrice}/night`;
  
  return basePrice;
};
