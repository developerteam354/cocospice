/**
 * Delivery radius utilities — frontend mirror of Backend/src/utils/deliveryRadius.ts
 *
 * Reads shop config from NEXT_PUBLIC_ env vars so the check runs in the browser
 * before the user even reaches the payment page.
 *
 * frontend/.env.local keys:
 *   NEXT_PUBLIC_SHOP_LAT            — shop latitude
 *   NEXT_PUBLIC_SHOP_LNG            — shop longitude
 *   NEXT_PUBLIC_DELIVERY_RADIUS_KM  — maximum delivery distance in km
 */

export const SHOP_LAT           = parseFloat(process.env.NEXT_PUBLIC_SHOP_LAT           ?? '53.2215');
export const SHOP_LNG           = parseFloat(process.env.NEXT_PUBLIC_SHOP_LNG           ?? '-0.5422');
export const DELIVERY_RADIUS_KM = parseFloat(process.env.NEXT_PUBLIC_DELIVERY_RADIUS_KM ?? '11');

// ─── Haversine formula ────────────────────────────────────────────────────────

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R    = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface RadiusCheckResult {
  allowed:    boolean;
  distanceKm: number;
}

export function checkDeliveryRadius(
  userLat: number,
  userLng: number
): RadiusCheckResult {
  const distanceKm = Math.round(
    haversineKm(SHOP_LAT, SHOP_LNG, userLat, userLng) * 10
  ) / 10;
  return { allowed: distanceKm <= DELIVERY_RADIUS_KM, distanceKm };
}
