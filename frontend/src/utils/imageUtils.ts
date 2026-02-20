/**
 * Utility functions for image processing, especially Cloudinary URLs
 */

/**
 * Check if a URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes("cloudinary.com");
};

/**
 * Transform a Cloudinary URL to add optimization parameters
 * @param url - The original Cloudinary URL
 * @param options - Transformation options
 * @returns - Optimized Cloudinary URL
 */
// utils/imageUtils.ts
export const optimizeCloudinaryUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "thumb";
    quality?: number | "auto";
    format?: "auto" | "webp" | "jpg" | "png";
    gravity?: "auto" | "face" | "center";
  } = {}
): string => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
    gravity = "auto",
  } = options;

  // Match the base part up to /upload/
  const uploadMatch = url.match(
    /(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)/
  );
  if (!uploadMatch) return url;

  const base = uploadMatch[1];
  const rest = url.slice(base.length);

  const transformations: string[] = [];

  if (width || height) {
    const dims = [];
    if (width) dims.push(`w_${width}`);
    if (height) dims.push(`h_${height}`);
    dims.push(`c_${crop}`);
    if (gravity !== "auto") dims.push(`g_${gravity}`);
    transformations.push(dims.join(","));
  }

  if (quality !== "auto") transformations.push(`q_${quality}`);
  else transformations.push("q_auto");

  if (format !== "auto") transformations.push(`f_${format}`);
  else transformations.push("f_auto");

  const transformString =
    transformations.length > 0 ? transformations.join(",") + "/" : "";

  const optimizedUrl = `${base}${transformString}${rest}`;

  console.log("Optimized URL:", optimizedUrl); // Keep for debugging

  return optimizedUrl;
};

/**
 * Get optimized image URL for property cards
 */
export const getPropertyCardImageUrl = (url: string): string => {
  return optimizeCloudinaryUrl(url, {
    width: 400,
    height: 300,
    crop: "fill",
    quality: "auto",
    format: "auto",
  });
};

/**
 * Get optimized image URL for property thumbnails
 */
export const getPropertyThumbnailUrl = (url: string): string => {
  return optimizeCloudinaryUrl(url, {
    width: 100,
    height: 100,
    crop: "thumb",
    quality: "auto",
    format: "auto",
    gravity: "face",
  });
};

/**
 * Get optimized image URL for property details page
 */
export const getPropertyDetailImageUrl = (url: string): string => {
  return optimizeCloudinaryUrl(url, {
    width: 1200,
    height: 800,
    crop: "fill",
    quality: "auto",
    format: "auto",
  });
};

/**
 * Get placeholder image URL when no image is available
 */
export const getPlaceholderImageUrl = (): string => {
  return "/placeholder-property.jpg";
};
