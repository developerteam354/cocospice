'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAddresses, addAddress, updateAddress } from '@/store/slices/addressSlice';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';
import { SavedAddress } from '@/types';
import type { PickedLocation } from '@/components/MapPickerModal/MapPickerModal';
import { checkDeliveryRadius, DELIVERY_RADIUS_KM, haversineKm, SHOP_LAT, SHOP_LNG } from '@/lib/deliveryRadius';
import OutOfRangeModal from '@/components/OutOfRangeModal/OutOfRangeModal';
import { fetchShopStatus } from '@/services/shopService';
import type { ShopStatusResponse } from '@/services/shopService';

// Lazy-load AddressModal to avoid CSS preload warning
const AddressModal = lazy(() => import('@/components/AddressModal/AddressModal'));

// MapPickerModal loaded client-only — Leaflet cannot run on the server
const MapPickerModal = dynamic(
  () => import('@/components/MapPickerModal/MapPickerModal'),
  { ssr: false }
);

// ─── Postcode geocoding (postcodes.io — free, no API key, UK only) ────────────

async function geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const clean = postcode.trim().replace(/\s+/g, '');
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 200 || !data.result) return null;
    return { lat: data.result.latitude, lng: data.result.longitude };
  } catch {
    return null;
  }
}

export default function AddressPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { orderType, setOrderType, shippingAddress, setShippingAddress } = useCart();

  const dispatch = useAppDispatch();
  const { items: addresses, loading, saving, error } = useAppSelector(s => s.addresses);

  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null); // ✅ Track address being edited
  const [continuing,   setContinuing]   = useState(false); // geocoding in progress

  // Out-of-range modal state
  const [outOfRange,       setOutOfRange]       = useState<{ distanceKm: number } | null>(null);
  const [shopStatusCache,  setShopStatusCache]  = useState<ShopStatusResponse | null>(null);

  // GPS / map-pin state
  const [gpsLoading,  setGpsLoading]  = useState(false);
  const [gpsSaving,   setGpsSaving]   = useState(false);
  const [gpsLat,      setGpsLat]      = useState<number | null>(null);
  const [gpsLng,      setGpsLng]      = useState<number | null>(null);
  const [gpsAddress,  setGpsAddress]  = useState('');
  const [gpsLine1,    setGpsLine1]    = useState('');
  const [gpsCity,     setGpsCity]     = useState('');
  const [gpsPostcode, setGpsPostcode] = useState('');
  const [gpsPhone,    setGpsPhone]    = useState(''); // ✅ Add phone state
  const [gpsSaved,    setGpsSaved]    = useState(false); // ✅ Track if GPS location is saved

  // Map picker
  const [showMap, setShowMap] = useState(false);
  const [mapLat,  setMapLat]  = useState(53.2215);  // default: Lincoln shop
  const [mapLng,  setMapLng]  = useState(-0.5422);

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

  // Fetch shop status once for the out-of-range modal (hours display)
  useEffect(() => {
    fetchShopStatus().then(setShopStatusCache).catch(() => {});
  }, []);

  // ── Redirect collection orders (initial load only) ───────────────────────
  // Use a ref so this only fires once on mount, not when we programmatically
  // switch to collection via handleSwitchToCollection (which navigates itself).
  const didMountRef = React.useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      if (orderType !== 'delivery') {
        router.replace('/checkout/payment');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Use Current Location — get GPS then open map for fine-tuning ─────────
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
        setShowMap(true);
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

  // ── Map confirm ───────────────────────────────────────────────────────────
  const handleMapConfirm = (loc: PickedLocation) => {
    setGpsLat(loc.lat);
    setGpsLng(loc.lng);
    setGpsAddress(loc.formattedAddress);
    setGpsLine1(loc.line1);
    setGpsCity(loc.city);
    setGpsPostcode(loc.postcode);
    // Pre-fill phone from user profile if available
    if (user?.phone && !gpsPhone) {
      setGpsPhone(user.phone);
    }
    setShowMap(false);
    toast.success('📍 Delivery location pinned!');
  };

  // ── Save GPS location as a reusable saved address ─────────────────────────
  const handleSaveGpsAddress = async () => {
    if (!gpsLat || !gpsLng || !user) return;
    
    // ✅ Validate phone before saving
    if (!gpsPhone || gpsPhone.trim().length < 10) {
      toast.error('Please enter a valid contact number (minimum 10 digits)');
      return;
    }
    
    setGpsSaving(true);
    try {
      const payload: Omit<SavedAddress, 'id'> = {
        label:     'Current Location',
        fullName:  user.name  || 'Me',
        line1:     gpsLine1   || gpsAddress.split(',')[0] || 'Current Location',
        line2:     '',
        city:      gpsCity    || '',
        postcode:  gpsPostcode || '',
        phone:     gpsPhone, // ✅ Use the entered phone
        isDefault: false,
      };
      
      console.log('💾 Saving GPS address with phone:', gpsPhone);
      
      const result = await dispatch(addAddress(payload));
      if (addAddress.fulfilled.match(result)) {
        const savedAddress = result.payload as SavedAddress;
        
        console.log('✅ Address saved successfully:', {
          id: savedAddress.id,
          phone: savedAddress.phone,
          line1: savedAddress.line1,
        });
        
        setSelectedId(savedAddress.id);
        setGpsSaved(true); // ✅ Mark as saved
        
        // ✅ Immediately update shipping address in cart context with the saved address
        setShippingAddress({
          id:               savedAddress.id,
          fullName:         savedAddress.fullName,
          line1:            savedAddress.line1,
          line2:            savedAddress.line2 || '',
          city:             savedAddress.city,
          postcode:         savedAddress.postcode,
          phone:            savedAddress.phone, // ✅ Phone from saved address
          instructions:     '',
          lat:              gpsLat,
          lng:              gpsLng,
          formattedAddress: gpsAddress,
        });
        
        toast.success('📍 Location saved! You can now continue to payment.');
        // Don't clear GPS data - keep it for display
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
    setGpsPhone(''); // ✅ Clear phone too
    setGpsSaved(false); // ✅ Reset saved status
  };

  // ── Address card handlers ─────────────────────────────────────────────────
  const handleSelect = (addr: SavedAddress) => {
    console.log('📍 Address selected:', {
      id: addr.id,
      label: addr.label,
      phone: addr.phone,
      line1: addr.line1,
    });
    setSelectedId(addr.id);
    setInstructions('');
    // Clear GPS pin when user switches to a saved address so the radius
    // check will use the saved address's postcode instead.
    clearGps();
  };

  const handleAddNew = async (newAddr: SavedAddress) => {
    const { id: _id, ...payload } = newAddr;
    const result = await dispatch(addAddress(payload));
    if (addAddress.fulfilled.match(result)) {
      toast.success('Address added successfully');
      setSelectedId((result.payload as SavedAddress).id);
      setShowModal(false);
      setEditingAddress(null); // ✅ Clear editing state
    }
  };

  // ✅ Handle address edit
  const handleEdit = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setShowModal(true);
  };

  // ✅ Handle address update
  const handleUpdate = async (updatedAddr: SavedAddress) => {
    const result = await dispatch(updateAddress(updatedAddr));
    if (updateAddress.fulfilled.match(result)) {
      toast.success('Address updated successfully');
      setShowModal(false);
      setEditingAddress(null);
    }
  };

  // ✅ Handle modal save (add or update)
  const handleModalSave = async (addr: SavedAddress) => {
    if (editingAddress) {
      await handleUpdate(addr);
    } else {
      await handleAddNew(addr);
    }
  };

  // ── Continue to Payment ───────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!selectedId) { toast.error('Please select a delivery address'); return; }
    
    // ✅ Check if GPS location is pinned but not saved
    if (gpsAddress && !gpsSaved) {
      toast.error('Please save your location to your addresses before continuing');
      return;
    }
    
    const chosen = addresses.find(a => a.id === selectedId);
    if (!chosen) { toast.error('Selected address not found'); return; }

    setContinuing(true);

    try {
      let checkLat: number;
      let checkLng: number;

      if (gpsLat != null && gpsLng != null) {
        // ── Path A: user pinned their location on the map — most accurate ──
        checkLat = gpsLat;
        checkLng = gpsLng;
      } else {
        // ── Path B: saved address — geocode the postcode via postcodes.io ──
        const postcode = chosen.postcode?.trim();
        if (!postcode) {
          toast.error('The selected address has no postcode. Please add one or pin your location on the map.');
          return;
        }

        toast.loading('Checking delivery availability…', { id: 'geocode' });
        const coords = await geocodePostcode(postcode);
        toast.dismiss('geocode');

        if (!coords) {
          toast.error(
            `We couldn't verify the postcode "${postcode}". Please pin your location on the map instead.`,
            { duration: 7000 }
          );
          return;
        }

        checkLat = coords.lat;
        checkLng = coords.lng;
      }

      // ── Haversine radius check ────────────────────────────────────────────
      const { allowed, distanceKm } = checkDeliveryRadius(checkLat, checkLng);
      if (!allowed) {
        setOutOfRange({ distanceKm });
        return;
      }

      // ── All good — set shipping address and proceed ───────────────────────
      console.log('🚀 Setting shipping address:', {
        chosenId: chosen.id,
        chosenPhone: chosen.phone,
        chosenAddress: `${chosen.line1}, ${chosen.city}`,
        hasGpsCoords: !!(gpsLat && gpsLng),
      });

      // ✅ Build shipping address with phone from the selected saved address
      const finalShippingAddress = {
        id:               chosen.id,
        fullName:         chosen.fullName,
        line1:            chosen.line1,
        line2:            chosen.line2 || '',
        city:             chosen.city,
        postcode:         chosen.postcode,
        phone:            chosen.phone, // ✅ Phone from saved address
        instructions,
        lat:              gpsLat  ?? undefined,
        lng:              gpsLng  ?? undefined,
        formattedAddress: gpsAddress || undefined,
      };
      
      console.log('📦 Final shipping address being set:', finalShippingAddress);
      
      setShippingAddress(finalShippingAddress);

      router.push('/checkout/payment');
    } finally {
      setContinuing(false);
    }
  };

  // ── Switch to collection from out-of-range modal ─────────────────────────
  const handleSwitchToCollection = () => {
    setOutOfRange(null);
    setOrderType('collection');   // ← update global state BEFORE navigating
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
                    style={{
                      position: 'relative', // ✅ For absolute positioning of edit button
                      ...(isSelected ? { borderColor: '#10b981', borderWidth: 2, boxShadow: '0 0 0 3px rgba(16,185,129,0.15)' } : {})
                    }}
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
                    {/* ✅ Edit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent selecting the address
                        handleEdit(addr);
                      }}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: '#f3f4f6',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#6b7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#10b981';
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
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

        {/* ── Use Current Location (optional — for more precise pinning) ── */}
        {!loading && (
          <div style={{ marginTop: 16 }}>

            {/* Info banner */}
            <div style={{
              marginBottom: 10, padding: '10px 14px',
              background: '#f0f9ff', border: '1.5px solid #bae6fd',
              borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>ℹ️</span>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#0369a1', fontWeight: 600, lineHeight: 1.5 }}>
                We deliver within <strong>{DELIVERY_RADIUS_KM} km</strong> of our Lincoln shop.
                Your address postcode will be checked automatically.
                For more precise location, you can also pin your exact spot on the map below.
              </p>
            </div>

            {/* Map pin button */}
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
                border:         gpsAddress ? '1.5px solid #10b981' : '1.5px solid #d1d5db',
                background:     gpsAddress ? '#f0fdf4' : '#f9fafb',
                color:          gpsAddress ? '#059669' : '#6b7280',
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
                  {gpsAddress ? '📍 Re-pin My Location' : '📍 Pin Exact Location on Map (Optional)'}
                </>
              )}
            </button>

            {/* Pinned location card */}
            {gpsAddress && (
              <div style={{
                marginTop: 10, padding: '14px 16px',
                background: gpsSaved ? '#f0fdf4' : '#fef3c7', 
                border: gpsSaved ? '1.5px solid #6ee7b7' : '1.5px solid #fbbf24',
                borderRadius: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: gpsSaved ? '#065f46' : '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {gpsSaved ? '✅ Saved Location' : '📍 Pinned Location'}
                  </span>
                  <button
                    type="button"
                    onClick={clearGps}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontWeight: 700, fontSize: '0.8rem', padding: '2px 6px' }}
                  >
                    ✕ Remove
                  </button>
                </div>

                <p style={{ margin: 0, fontSize: '0.85rem', color: gpsSaved ? '#047857' : '#92400e', fontWeight: 600, lineHeight: 1.5 }}>
                  {gpsAddress}
                </p>

                {gpsLat && gpsLng && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                    {gpsLat.toFixed(6)}, {gpsLng.toFixed(6)}
                  </p>
                )}

                {/* ✅ Phone number input for GPS location */}
                {!gpsSaved && (
                  <>
                    <div style={{ marginTop: 12 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                        Contact Number <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={gpsPhone}
                        onChange={(e) => setGpsPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #fbbf24',
                          background: '#fff',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#92400e',
                          outline: 'none',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#fbbf24'; e.target.style.boxShadow = 'none'; }}
                      />
                      <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>
                        Required for delivery coordination
                      </p>
                    </div>

                    {/* ⚠️ Important instruction message */}
                    <div style={{
                      marginTop: 12,
                      padding: '10px 12px',
                      background: '#fef3c7',
                      border: '1.5px solid #fbbf24',
                      borderRadius: 10,
                    }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e', fontWeight: 700, lineHeight: 1.5 }}>
                        ⚠️ <strong>Important:</strong> You must save this location before continuing to payment.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveGpsAddress}
                      disabled={gpsSaving || !gpsPhone || gpsPhone.trim().length < 10}
                      style={{
                        marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '10px 18px', borderRadius: 10, border: 'none',
                        background: (gpsSaving || !gpsPhone || gpsPhone.trim().length < 10) ? '#d1d5db' : '#f59e0b',
                        color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                        cursor: (gpsSaving || !gpsPhone || gpsPhone.trim().length < 10) ? 'not-allowed' : 'pointer',
                        width: '100%',
                        justifyContent: 'center',
                      }}
                    >
                      {gpsSaving ? (
                        <>
                          <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.75s linear infinite' }} />
                          Saving…
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                          </svg>
                          Save This Address
                        </>
                      )}
                    </button>
                  </>
                )}

                {/* ✅ Success message when saved */}
                {gpsSaved && (
                  <div style={{
                    marginTop: 12,
                    padding: '10px 12px',
                    background: '#d1fae5',
                    border: '1.5px solid #6ee7b7',
                    borderRadius: 10,
                  }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#065f46', fontWeight: 700, lineHeight: 1.5 }}>
                      ✅ Location saved! You can now continue to payment.
                    </p>
                  </div>
                )}
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
          disabled={loading || continuing || (!selectedId && addresses.length > 0) || Boolean(gpsAddress && !gpsSaved)}
          style={{
            opacity: (gpsAddress && !gpsSaved) ? 0.5 : 1,
            cursor: (gpsAddress && !gpsSaved) ? 'not-allowed' : 'pointer',
          }}
        >
          {continuing ? (
            <><div className={styles.spinner} />Checking delivery area…</>
          ) : loading ? (
            <><div className={styles.spinner} />Loading...</>
          ) : (gpsAddress && !gpsSaved) ? (
            <>
              🔒 Save Location First
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </>
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
            address={editingAddress || undefined} // ✅ Pass address when editing
            onClose={() => {
              setShowModal(false);
              setEditingAddress(null); // ✅ Clear editing state on close
            }}
            onSave={handleModalSave} // ✅ Use unified save handler
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

      {/* Out of Delivery Range Modal */}
      {outOfRange && (
        <OutOfRangeModal
          distanceKm={outOfRange.distanceKm}
          radiusKm={DELIVERY_RADIUS_KM}
          shopClosed={shopStatusCache ? !shopStatusCache.isOpen : false}
          openFrom={shopStatusCache?.openFrom}
          openUntil={shopStatusCache?.openUntil}
          closingReason={shopStatusCache?.closingReason}
          onClose={() => setOutOfRange(null)}
          onSwitchToCollection={handleSwitchToCollection}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
