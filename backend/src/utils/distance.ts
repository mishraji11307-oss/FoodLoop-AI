/**
 * Calculates the great-circle distance between two geographic coordinates in kilometers
 * using the Haversine formula.
 */
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (angle: number) => (angle * Math.PI) / 180;
  const R = 6371; // Earth's mean radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Return rounded to 2 decimal places
  return Math.round(distance * 100) / 100;
};

/**
 * Calculates a normalized distance score (0-100) where 0km = 100, and >= 25km = 0
 */
export const calculateDistanceScore = (distanceKm: number, maxRadiusKm = 25): number => {
  if (distanceKm <= 0) return 100;
  if (distanceKm >= maxRadiusKm) return 0;
  return Math.round(((maxRadiusKm - distanceKm) / maxRadiusKm) * 100);
};
