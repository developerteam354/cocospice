/**
 * Delivery radius utilities.
 *
 * Shop coordinates and radius are read from environment variables so they
 * can be updated without a code change when the shop moves.
 *
 * Backend/.env keys:
 *   SHOP_LAT            — shop latitude  (decimal degrees)
 *   SHOP_LNG            — shop longitude (decimal degrees)
 *   DELIVERY_RADIUS_KM  — maximum delivery distance in kilometres
 */

// ─── Shop config (read once at startup) ──────────────────────────────────────

export const SHOP_LAT          = parseFloat(process.env.SHOP_LAT           ?? '53.2215');
export const SHOP_LNG          = parseFloat(process.env.SHOP_LNG           ?? '-0.5422');
export const DELIVERY_RADIUS_KM = parseFloat(process.env.DELIVERY_RADIUS_KM ?? '11');

// ─── Haversine formula ────────────────────────────────────────────────────────
// Returns the great-circle distance between two points in kilometres.

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R    = 6371;                          // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ─── Convenience check ────────────────────────────────────────────────────────

export interface RadiusCheckResult {
  allowed:     boolean;
  distanceKm:  number;   // rounded to 1 decimal place
}

export function checkDeliveryRadius(
  userLat: number,
  userLng: number
): RadiusCheckResult {
  const distanceKm = Math.round(
    haversineKm(SHOP_LAT, SHOP_LNG, userLat, userLng) * 10
  ) / 10;

  return {
    allowed:    distanceKm <= DELIVERY_RADIUS_KM,
    distanceKm,
  };
}
