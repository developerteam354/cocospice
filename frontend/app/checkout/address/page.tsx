'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAddresses, addAddress } from '@/store/slices/addressSlice';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';
import { SavedAddress } from '@/types';
import type { PickedLocation } from '@/components/MapPickerModal/MapPickerModal';
import { checkDeliveryRadius, DELIVERY_RADIUS_KM } from '@/lib/deliveryRadius';

// Lazy-load AddressModal to avoid CSS preload warning
const AddressModal = lazy(() => import('@/components/AddressModal/AddressModal'));

// MapPickerModal loaded client-only — Leaflet cannot run on the server
const MapPickerModal = dynamic(
  () => import('@/components/MapPickerModal/MapPickerModal'),
  { ssr: false }
);

export default function AddressPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { orderType, shippingAddress, setShippingAddress } = useCart();

  const dispatch   = useAppDispatch();
  const { items: addresses, loading, saving, error } = useAppSelector(s => s.addresses);

  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [showModal,    setShowModal]    = useState(false);

  // GPS state
  const [gpsLoading,    setGpsLoading]    = useState(false);
  const [gpsSaving,     setGpsSaving]     = useState(false);
  const [gpsLat,        setGpsLat]        = useState<number | null>(null);
  const [gpsLng,        setGpsLng]        = useState<number | null>(null);
  const [gpsAddress,    setGpsAddress]    = useState('');
  const [gpsLine1,      setGpsLine1]      = useState('');
  const [gpsCity,       setGpsCity]       = useState('');
  const [gpsPostcode,   setGpsPostcode]   = useState('');
  // Map picker
  const [showMap,       setShowMap]       = useState(false);
  const [mapLat,        setMapLat]        = useState(51.5074);
  const [mapLng,        setMapLng]        = useState(-0.1278);

  // ── Fetch addresses on mount ──────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  // ── Auto-select default address ───────────────────────────────────────────
  useEffect(() => {
    if (addresses.length === 0) return;
    if (shippingAddress.id) {
      const still = addresses.some(a => a.id === shippingAddress.id);
      if (still) { setSelectedId(shippingAddress.id); return; }
    }
    const def = addresses.find(a => a.isDefault) ?? addresses[0];
    setSelectedId(def.id);
  }, [addresses]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ── Redirect collection orders (after all hooks) ──────────────────────────
  if (orderType !== 'delivery') {
    router.replace('/checkout/payment');
    return null;
  }

  // ── Use Current Location — get GPS then open map for fine-tuning ────────
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGpsLoading(false);
        setMapLat(coords.latitude);
        setMapLng(coords.longitude);
        setShowMap(true);   // open the Leaflet map modal
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED)
          toast.error('Location permission denied. Please allow it in your browser settings.');
        else if (err.code === err.POSITION_UNAVAILABLE)
          toast.error('Location unavailable. Please try again.');
        else
          toast.error('Could not get your location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Map confirm — user dragged pin to exact spot ──────────────────────────
  const handleMapConfirm = (loc: PickedLocation) => {
    setGpsLat(loc.lat);
    setGpsLng(loc.lng);
    setGpsAddress(loc.formattedAddress);
    setGpsLine1(loc.line1);
    setGpsCity(loc.city);
    setGpsPostcode(loc.postcode);
    setShowMap(false);
    toast.success('📍 Delivery location pinned!');
  };

  // ── Save GPS location as a reusable saved address ─────────────────────────
  const handleSaveGpsAddress = async () => {
    if (!gpsLat || !gpsLng || !user) return;
    setGpsSaving(true);
    try {
      const payload: Omit<SavedAddress, 'id'> = {
        label:     'Current Location',
        fullName:  user.name  || 'Me',
        line1:     gpsLine1   || gpsAddress.split(',')[0] || 'Current Location',
        line2:     '',
        city:      gpsCity    || '',
        postcode:  gpsPostcode || '',
        phone:     user.phone || '',
        isDefault: false,
      };
      const result = await dispatch(addAddress(payload));
      if (addAddress.fulfilled.match(result)) {
        setSelectedId((result.payload as SavedAddress).id);
        toast.success('Location saved to your addresses!');
        clearGps();
      } else {
        toast.error('Could not save address. Please try again.');
      }
    } finally {
      setGpsSaving(false);
    }
  };

  const clearGps = () => {
    setGpsLat(null); setGpsLng(null);
    setGpsAddress(''); setGpsLine1(''); setGpsCity(''); setGpsPostcode('');
  };

  // ── Address card handlers ─────────────────────────────────────────────────
  const handleSelect = (addr: SavedAddress) => {
    setSelectedId(addr.id);
    setInstructions('');
  };

  const handleAddNew = async (newAddr: SavedAddress) => {
    const { id: _id, ...payload } = newAddr;
    const result = await dispatch(addAddress(payload));
    if (addAddress.fulfilled.match(result)) {
      toast.success('Address added successfully');
      setSelectedId((result.payload as SavedAddress).id);
      setShowModal(false);
    }
  };

  const handleContinue = () => {
    if (!selectedId) { toast.error('Please select a delivery address'); return; }
    const chosen = addresses.find(a => a.id === selectedId);
    if (!chosen) { toast.error('Selected address not found'); return; }

    // ── Delivery radius check (frontend guard) ────────────────────────────
    // Only enforced when the user has confirmed GPS coordinates via the map.
    // Manually typed addresses without coordinates bypass this check.
    if (gpsLat != null && gpsLng != null) {
      const { allowed, distanceKm } = checkDeliveryRadius(gpsLat, gpsLng);
      if (!allowed) {
        toast.error(
          `Delivery Unavailable: We only deliver within ${DELIVERY_RADIUS_KM} km of our shop. Your location is ${distanceKm} km away.`,
          { duration: 6000 }
        );
        return;
      }
    }

    setShippingAddress({
      id:               chosen.id,
      fullName:         chosen.fullName,
      line1:            gpsLine1    || chosen.line1,
      line2:            chosen.line2 || '',
      city:             gpsCity     || chosen.city,
      postcode:         gpsPostcode || chosen.postcode,
      phone:            chosen.phone,
      instructions,
      lat:              gpsLat  ?? undefined,
      lng:              gpsLng  ?? undefined,
      formattedAddress: gpsAddress || undefined,
    });

    router.push('/checkout/payment');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Delivery Address</h2>

        {/* Loading skeleton */}
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading your addresses...</p>
          </div>
        )}

        {/* Address list */}
        {!loading && (
          <div className={styles.addressSelection}>
            {addresses.length > 0 && (
              <p className={styles.label} style={{ marginBottom: 12 }}>
                Choose a delivery location:
              </p>
            )}

            <div className={styles.addressGrid}>
              {addresses.map(addr => {
                const isSelected = selectedId === addr.id;
                return (
                  <div
                    key={addr.id}
                    className={`${styles.addressOption} ${isSelected ? styles.addressOptionActive : ''}`}
                    onClick={() => handleSelect(addr)}
                    style={isSelected ? { borderColor: '#10b981', borderWidth: 2, boxShadow: '0 0 0 3px rgba(16,185,129,0.15)' } : undefined}
                  >
                    <div
                      className={styles.addressCheck}
                      style={isSelected ? { background: '#10b981', borderColor: '#10b981' } : undefined}
                    >
                      {isSelected && <span>✓</span>}
                    </div>
                    <div className={styles.addressInfo}>
                      <p className={styles.addressLabel}>
                        <strong>{addr.label}</strong>
                        {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                        {isSelected && (
                          <span style={{ marginLeft: 6, background: 'rgba(16,185,129,0.12)', color: '#059669', fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Deliver Here
                          </span>
                        )}
                      </p>
                      <p className={styles.addressTextSmall}>{addr.fullName}</p>
                      <p className={styles.addressTextSmall}>
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.postcode}
                      </p>
                      <p className={styles.addressTextSmall}>{addr.phone}</p>
                    </div>
                  </div>
                );
              })}

              {/* Add New Address card */}
              <div
                className={styles.addressOption}
                onClick={() => setShowModal(true)}
                style={{ borderStyle: 'dashed', cursor: 'pointer' }}
              >
                <div className={styles.addressCheck} style={{ fontSize: '1rem', border: 'none', color: '#10b981' }}>+</div>
                <div className={styles.addressInfo}>
                  <p className={styles.addressLabel}><strong style={{ color: '#10b981' }}>Add New Address</strong></p>
                  <p className={styles.addressTextSmall}>Save a new delivery location</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Use Current Location ── */}
        {!loading && (
          <div style={{ marginTop: 16 }}>

            {/* Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gpsLoading}
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            8,
                width:          '100%',
                padding:        '12px 20px',
                borderRadius:   14,
                border:         '1.5px solid #10b981',
                background:     gpsAddress ? '#f0fdf4' : '#ffffff',
                color:          '#059669',
                fontSize:       '0.9rem',
                fontWeight:     700,
                cursor:         gpsLoading ? 'not-allowed' : 'pointer',
                opacity:        gpsLoading ? 0.75 : 1,
                transition:     'all 0.2s',
              }}
            >
              {gpsLoading ? (
                <>
                  <span style={{
                    width: 16, height: 16, flexShrink: 0,
                    border: '2.5px solid #10b981', borderTopColor: 'transparent',
                    borderRadius: '50%', display: 'inline-block',
                    animation: 'spin 0.75s linear infinite',
                  }} />
                  Detecting your location…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {gpsAddress ? '📍 Re-detect My Location' : '📍 Use My Current Location'}
                </>
              )}
            </button>

            {/* Detected address result card */}
            {gpsAddress && (
              <div style={{
                marginTop: 10, padding: '14px 16px',
                background: '#f0fdf4', border: '1.5px solid #6ee7b7',
                borderRadius: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    📍 Your Current Location
                  </span>
                  <button
                    type="button"
                    onClick={clearGps}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontWeight: 700, fontSize: '0.8rem', padding: '2px 6px' }}
                  >
                    ✕ Remove
                  </button>
                </div>

                <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857', fontWeight: 600, lineHeight: 1.5 }}>
                  {gpsAddress}
                </p>

                {gpsLat && gpsLng && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                    {gpsLat.toFixed(6)}, {gpsLng.toFixed(6)}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSaveGpsAddress}
                  disabled={gpsSaving}
                  style={{
                    marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 10, border: 'none',
                    background: gpsSaving ? '#d1fae5' : '#059669',
                    color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                    cursor: gpsSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {gpsSaving ? (
                    <>
                      <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.75s linear infinite' }} />
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Save to My Addresses
                    </>
                  )}
                </button>

                <p style={{ margin: '8px 0 0', fontSize: '0.74rem', color: '#6b7280', lineHeight: 1.4 }}>
                  Coordinates are saved with your order so the admin can see your exact delivery point on a map.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Delivery instructions */}
        {!loading && selectedId && (
          <div className={styles.fieldGroup} style={{ marginTop: 20 }}>
            <label className={styles.label}>
              Delivery Instructions <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Leave at door, ring bell twice…"
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </div>
        )}

        {/* Empty state */}
        {!loading && addresses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📍</div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>No saved addresses yet</p>
            <p style={{ fontSize: '0.88rem' }}>Click &quot;Add New Address&quot; above to get started.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <button
          className={styles.ctaBtn}
          onClick={handleContinue}
          disabled={loading || (!selectedId && addresses.length > 0)}
        >
          {loading ? (
            <><div className={styles.spinner} />Loading...</>
          ) : (
            <>
              Continue to Payment
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </footer>

      {/* Add New Address Modal */}
      {showModal && (
        <Suspense fallback={null}>
          <AddressModal
            onClose={() => setShowModal(false)}
            onSave={handleAddNew}
            saving={saving}
          />
        </Suspense>
      )}

      {/* Map Picker Modal */}
      {showMap && (
        <MapPickerModal
          initialLat={mapLat}
          initialLng={mapLng}
          onConfirm={handleMapConfirm}
          onClose={() => { setShowMap(false); setGpsLoading(false); }}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
