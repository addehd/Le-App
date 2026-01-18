/**
 * Coordinate validation utilities for map markers
 * Ensures that latitude and longitude values are valid before rendering
 */

/**
 * Validates if a value is a valid coordinate number
 * @param value - The value to check
 * @returns true if valid number (not NaN, not null, not undefined)
 */
export function isValidCoordinate(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Validates latitude is within valid range (-90 to 90)
 */
export function isValidLatitude(lat: any): lat is number {
  return isValidCoordinate(lat) && lat >= -90 && lat <= 90;
}

/**
 * Validates longitude is within valid range (-180 to 180)
 */
export function isValidLongitude(lng: any): lng is number {
  return isValidCoordinate(lng) && lng >= -180 && lng <= 180;
}

/**
 * Type guard to check if an object has valid coordinates
 * Returns true if latitude and longitude are valid numbers in range
 * After this check, TypeScript will know the coordinates are defined
 */
export function hasValidCoordinates(
  obj: { latitude?: number; longitude?: number }
): obj is { latitude: number; longitude: number } {
  return isValidLatitude(obj.latitude) && isValidLongitude(obj.longitude);
}

/**
 * Default fallback coordinates (Valle Sagrado, Peru - matching app default)
 * Use these if you need to show a property at a default location
 */
export const DEFAULT_COORDINATES = {
  latitude: -13.3048,
  longitude: -71.9589,
} as const;
