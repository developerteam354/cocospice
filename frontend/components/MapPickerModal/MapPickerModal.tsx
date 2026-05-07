'use client';

/**
 * MapPickerModal — professional Leaflet map picker.
 *
 * MUST be imported via next/dynamic with { ssr: false } — Leaflet needs window.
 *
 * Features:
 *  - Opens centred on the user's GPS coordinates
 *  - Draggable green pin — reverse geocodes on drag-end
 *  - Click anywhere on the map to move the pin
 *  - Search bar (Nominatim forward geocoding) — moves pin + map to result
 *  - Confirm returns { lat, lng, formattedAddress, line1, city, postcode }
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import type { Marker as LMarker } from 'leaflet';
import L from 'leaflet';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickedLocation {
  lat:              number;
  lng:              number;
  formattedAddress: string;
  line1:            string;
  city:             string;
  postcode:         string;
}

interface Props {
  initialLat: number;
  initialLng: number;
  onConfirm:  (loc: PickedLocation) => void;
  onClose:    () => void;
}

// ─── Nominatim reverse geocoding ─────────────────────────────────────────────

async function reverseGeocode(lat: number, lng: number): Promise<PickedLocation> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'CocospiceApp/1.0' } }
    );
    if (!res.ok) throw new Error('failed');
    const d = await res.json();
    const a = d.address ?? {};
    const line1 = [a.house_number, a.road || a.pedestrian || a.footway]
      .filter(Boolean).join(' ') || d.display_name?.split(',')[0] || '';
    return {
      lat, lng,
      formattedAddress: d.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      line1,
      city:     a.city || a.town || a.village || a.county || '',
      postcode: a.postcode || '',
    };
  } catch {
    return { lat, lng, formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, line1: '', city: '', postcode: '' };
  }
}

// ─── Nominatim forward geocoding (search) ────────────────────────────────────

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

async function forwardGeocode(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'CocospiceApp/1.0' } }
  );
  if (!res.ok) return [];
  return res.json();
}

// ─── Sub-component: click-to-move ────────────────────────────────────────────

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// ─── Sub-component: programmatic fly-to ──────────────────────────────────────
// Receives a target position and flies the map there whenever it changes.

function FlyToMarker({ target }: { target: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(target, Math.max(map.getZoom(), 16), { animate: true, duration: 0.8 });
  }, [target, map]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MapPickerModal({ initialLat, initialLng, onConfirm, onClose }: Props) {
  const markerRef = useRef<LMarker>(null);

  const [pos,          setPos]          = useState<[number, number]>([initialLat, initialLng]);
  const [flyTarget,    setFlyTarget]    = useState<[number, number] | null>(null);
  const [address,      setAddress]      = useState('');
  const [geocoding,    setGeocoding]    = useState(true);
  const [icon,         setIcon]         = useState<L.DivIcon | null>(null);

  // Search state
  const [searchQuery,  setSearchQuery]  = useState('');
  const [searching,    setSearching]    = useState(false);
  const [searchResults,setSearchResults]= useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // ── Build icon + initial geocode after mount ──────────────────────────────
  useEffect(() => {
    setIcon(L.divIcon({
      className: '',
      html: `<div style="width:36px;height:48px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.35))">
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

    reverseGeocode(initialLat, initialLng).then(r => {
      setAddress(r.formattedAddress);
      setGeocoding(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Move pin + reverse geocode ────────────────────────────────────────────
  const handleMove = useCallback(async (lat: number, lng: number, fly = false) => {
    setPos([lat, lng]);
    if (fly) setFlyTarget([lat, lng]);
    setGeocoding(true);
    const r = await reverseGeocode(lat, lng);
    setAddress(r.formattedAddress);
    setGeocoding(false);
  }, []);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setShowDropdown(false);
    try {
      const results = await forwardGeocode(q);
      if (results.length === 0) {
        setSearchResults([]);
        setShowDropdown(false);
        // Show a subtle inline message instead of a toast
        setAddress('No results found. Try a different search term.');
      } else if (results.length === 1) {
        // Single result — jump straight to it
        const r = results[0];
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        await handleMove(lat, lng, true);
      } else {
        setSearchResults(results);
        setShowDropdown(true);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = async (r: SearchResult) => {
    setShowDropdown(false);
    setSearchQuery(r.display_name.split(',')[0]);
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    await handleMove(lat, lng, true);
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setGeocoding(true);
    const r = await reverseGeocode(pos[0], pos[1]);
    setGeocoding(false);
    onConfirm(r);
  };

  // ── Spinner element ───────────────────────────────────────────────────────
  const Spinner = ({ size = 14, color = '#10b981' }: { size?: number; color?: string }) => (
    <div style={{
      width: size, height: size, flexShrink: 0,
      border: `2px solid ${color}33`, borderTopColor: color,
      borderRadius: '50%', animation: 'mpspin .7s linear infinite',
    }} />
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 620,
        overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.25)',
        display: 'flex', flexDirection: 'column', maxHeight: '94vh',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#111827' }}>
              📍 Pin Your Exact Delivery Location
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#6b7280', fontWeight: 500 }}>
              Search, drag the pin, or tap the map to set your exact spot
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 9, border: '1.5px solid #e5e7eb',
              background: '#f9fafb', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#6b7280',
              fontSize: '0.9rem', flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Search bar — sits ABOVE the map, no overlap with zoom controls ── */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0, position: 'relative' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"
                style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowDropdown(false); }}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); if (e.key === 'Escape') setShowDropdown(false); }}
                placeholder="Search for a place, street or area…"
                style={{
                  width: '100%', height: 40, paddingLeft: 34, paddingRight: 12,
                  borderRadius: 10, border: '1.5px solid #e5e7eb',
                  background: '#f9fafb', fontSize: '0.85rem', fontWeight: 500,
                  color: '#111827', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color .15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#fff'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              style={{
                height: 40, padding: '0 16px', borderRadius: 10, border: 'none',
                background: searching || !searchQuery.trim() ? '#d1fae5' : '#059669',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                cursor: searching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                transition: 'background .15s',
              }}
            >
              {searching ? <Spinner size={13} color="#fff" /> : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              )}
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>

          {/* Search results dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 16, right: 16, zIndex: 1000,
              background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,.12)', overflow: 'hidden',
              marginTop: 2,
            }}>
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectResult(r)}
                  style={{
                    width: '100%', padding: '10px 14px', border: 'none',
                    background: 'transparent', textAlign: 'left', cursor: 'pointer',
                    fontSize: '0.82rem', color: '#374151', fontWeight: 500,
                    borderBottom: i < searchResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f0fdf4'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <span style={{ flexShrink: 0, marginTop: 1 }}>📍</span>
                  <span style={{ lineHeight: 1.4 }}>{r.display_name}</span>
                </button>
              ))}
              <button
                onClick={() => setShowDropdown(false)}
                style={{ width: '100%', padding: '8px 14px', border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600 }}
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* ── Map ── */}
        <div style={{ width: '100%', height: 300, flexShrink: 0, position: 'relative' }}>
          {icon ? (
            <MapContainer
              center={[initialLat, initialLng]}
              zoom={16}
              style={{ width: '100%', height: '300px' }}
              zoomControl   // zoom controls stay bottom-right by default — no overlap
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                maxZoom={19}
              />

              {/* Fly to marker when search result is selected */}
              {flyTarget && <FlyToMarker target={flyTarget} />}

              <MapClickHandler onMapClick={(lat, lng) => handleMove(lat, lng)} />

              <Marker
                position={pos}
                icon={icon}
                draggable
                ref={markerRef}
                eventHandlers={{
                  dragend() {
                    const ll = markerRef.current?.getLatLng();
                    if (ll) handleMove(ll.lat, ll.lng);
                  },
                }}
              />
            </MapContainer>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', flexDirection: 'column', gap: 10 }}>
              <Spinner size={32} />
              <span style={{ fontSize: '0.83rem', color: '#6b7280', fontWeight: 600 }}>Loading map…</span>
            </div>
          )}
        </div>

        {/* ── Address preview ── */}
        <div style={{
          padding: '10px 18px', background: '#f9fafb',
          borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6',
          minHeight: 46, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          {geocoding ? (
            <><Spinner /><span style={{ fontSize: '0.81rem', color: '#6b7280', fontWeight: 500 }}>Getting address…</span></>
          ) : (
            <><span style={{ flexShrink: 0 }}>📍</span>
              <span style={{ fontSize: '0.81rem', color: '#374151', fontWeight: 600, lineHeight: 1.4 }}>
                {address || 'Move the pin to see the address'}
              </span>
            </>
          )}
        </div>

        {/* ── Coordinates ── */}
        <div style={{ padding: '4px 18px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontFamily: 'monospace', fontWeight: 600 }}>
            {pos[0].toFixed(6)}, {pos[1].toFixed(6)}
          </span>
        </div>

        {/* ── Actions ── */}
        <div style={{ padding: '12px 18px', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 44, borderRadius: 13, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 700, fontSize: '0.87rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={geocoding}
            style={{
              flex: 1.5, height: 44, borderRadius: 13, border: 'none',
              background: geocoding ? '#d1fae5' : 'linear-gradient(135deg,#10b981,#059669)',
              color: '#fff', fontWeight: 800, fontSize: '0.9rem',
              cursor: geocoding ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              boxShadow: geocoding ? 'none' : '0 4px 14px rgba(16,185,129,.35)',
              transition: 'all .2s',
            }}
          >
            {geocoding ? (
              <><Spinner color="#fff" /><span>Getting address…</span></>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirm Location
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes mpspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
