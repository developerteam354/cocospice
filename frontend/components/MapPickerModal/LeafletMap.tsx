'use client';

/**
 * LeafletMap — loaded ONLY via next/dynamic with { ssr: false }.
 * Never imported directly — Leaflet requires window/document.
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickedLocation {
  lat:              number;
  lng:              number;
  formattedAddress: string;
  line1:            string;
  city:             string;
  postcode:         string;
}

export interface LeafletMapProps {
  initialLat:       number;
  initialLng:       number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

// ─── Nominatim reverse geocoding (free, no key) ───────────────────────────────

export async function reverseGeocode(lat: number, lng: number): Promise<PickedLocation> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'CocospiceApp/1.0' } }
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    const a = data.address ?? {};
    const line1 = [a.house_number, a.road || a.pedestrian || a.footway]
      .filter(Boolean).join(' ') || data.display_name?.split(',')[0] || '';
    return {
      lat, lng,
      formattedAddress: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      line1,
      city:     a.city || a.town || a.village || a.county || '',
      postcode: a.postcode || '',
    };
  } catch {
    return { lat, lng, formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, line1: '', city: '', postcode: '' };
  }
}

// ─── Click-to-move sub-component ─────────────────────────────────────────────

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LeafletMapComponent({ initialLat, initialLng, onLocationChange }: LeafletMapProps) {
  const markerRef = useRef<LeafletMarker>(null);
  const [pos, setPos] = useState<[number, number]>([initialLat, initialLng]);

  // Build the icon INSIDE the component — never at module level.
  // L.divIcon accesses the DOM; calling it at module scope can fail
  // before Leaflet is fully initialised.
  const [icon, setIcon] = useState<any>(null);
  useEffect(() => {
    import('leaflet').then(L => {
      setIcon(L.divIcon({
        className: '',
        html: `<div style="width:36px;height:48px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3))">
          <svg viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 0C8.059 0 0 8.059 0 18c0 11.955 16.2 27.9 16.92 28.62a1.5 1.5 0 002.16 0C19.8 45.9 36 29.955 36 18 36 8.059 27.941 0 18 0z" fill="#059669"/>
            <circle cx="18" cy="18" r="8" fill="white"/>
            <circle cx="18" cy="18" r="5" fill="#059669"/>
          </svg>
        </div>`,
        iconSize:    [36, 48],
        iconAnchor:  [18, 48],
        popupAnchor: [0, -48],
      }));
    });
  }, []);

  const handleMove = async (lat: number, lng: number) => {
    setPos([lat, lng]);
    const result = await reverseGeocode(lat, lng);
    onLocationChange(lat, lng, result.formattedAddress);
  };

  // Initial reverse geocode
  useEffect(() => {
    reverseGeocode(initialLat, initialLng).then(r => {
      onLocationChange(initialLat, initialLng, r.formattedAddress);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Don't render the Marker until the icon is ready
  if (!icon) return null;

  return (
    <MapContainer
      center={[initialLat, initialLng]}
      zoom={16}
      style={{ width: '100%', height: '340px' }}
      zoomControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <ClickHandler onMapClick={handleMove} />
      <Marker
        position={pos}
        icon={icon}
        draggable
        ref={markerRef}
        eventHandlers={{
          dragend() {
            const latlng = markerRef.current?.getLatLng();
            if (latlng) handleMove(latlng.lat, latlng.lng);
          },
        }}
      />
    </MapContainer>
  );
}
