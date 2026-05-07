'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAddresses, addAddress } from '@/store/slices/addressSlice';
import AddressModal from '@/components/AddressModal/AddressModal';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';
import { SavedAddress } from '@/types';

export default function AddressPage() {
  const router   = useRouter();
  const { user } = useAuth();
  const { orderType, shippingAddress, setShippingAddress } = useCart();

  const dispatch = useAppDispatch();
  const { items: addresses, loading, saving, error } = useAppSelector(s => s.addresses);

  // Which address card is currently selected
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Delivery instructions (shown when a saved address is selected)
  const [instructions, setInstructions] = useState('');

  // Add-new-address modal
  const [showModal, setShowModal] = useState(false);

  // ── Fetch addresses on mount ──────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  // ── Auto-select default (or first) address once list loads ───────────────
  useEffect(() => {
    if (addresses.length === 0) return;

    // If cart already has a saved address, keep it selected
    if (shippingAddress.id) {
      const stillExists = addresses.some(a => a.id === shippingAddress.id);
      if (stillExists) {
        setSelectedId(shippingAddress.id);
        return;
      }
    }

    // Otherwise pick the default, or the first one
    const def = addresses.find(a => a.isDefault) ?? addresses[0];
    setSelectedId(def.id);
  }, [addresses]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Show API errors via toast ─────────────────────────────────────────────
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ── Redirect collection orders ────────────────────────────────────────────
  if (orderType !== 'delivery') {
    router.replace('/checkout/payment');
    return null;
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelect = (addr: SavedAddress) => {
    setSelectedId(addr.id);
    setInstructions('');
  };

  const handleAddNew = async (newAddr: SavedAddress) => {
    const { id: _id, ...payload } = newAddr;
    const result = await dispatch(addAddress(payload));

    if (addAddress.fulfilled.match(result)) {
      const saved = result.payload as SavedAddress;
      toast.success('Address added successfully');
      setSelectedId(saved.id);   // auto-select the new address
      setShowModal(false);
    }
    // error is shown via the useEffect above
  };

  const handleContinue = () => {
    if (!selectedId) {
      toast.error('Please select a delivery address');
      return;
    }

    const chosen = addresses.find(a => a.id === selectedId);
    if (!chosen) {
      toast.error('Selected address not found');
      return;
    }

    setShippingAddress({
      id:           chosen.id,
      fullName:     chosen.fullName,
      line1:        chosen.line1,
      line2:        chosen.line2 || '',
      city:         chosen.city,
      postcode:     chosen.postcode,
      phone:        chosen.phone,
      instructions: instructions,
    });

    router.push('/checkout/payment');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Delivery Address</h2>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading your addresses...</p>
          </div>
        )}

        {/* ── Address list ── */}
        {!loading && (
          <div className={styles.addressSelection}>
            {addresses.length > 0 && (
              <p className={styles.label} style={{ marginBottom: 12 }}>
                Choose a delivery location:
              </p>
            )}

            <div className={styles.addressGrid}>
              {/* Saved address cards */}
              {addresses.map(addr => {
                const isSelected = selectedId === addr.id;
                return (
                  <div
                    key={addr.id}
                    className={`${styles.addressOption} ${isSelected ? styles.addressOptionActive : ''}`}
                    onClick={() => handleSelect(addr)}
                    style={
                      isSelected
                        ? { borderColor: '#10b981', borderWidth: 2, boxShadow: '0 0 0 3px rgba(16,185,129,0.15)' }
                        : undefined
                    }
                  >
                    {/* Radio circle */}
                    <div
                      className={styles.addressCheck}
                      style={isSelected ? { background: '#10b981', borderColor: '#10b981' } : undefined}
                    >
                      {isSelected && <span>✓</span>}
                    </div>

                    <div className={styles.addressInfo}>
                      <p className={styles.addressLabel}>
                        <strong>{addr.label}</strong>
                        {addr.isDefault && (
                          <span className={styles.defaultBadge}>Default</span>
                        )}
                        {isSelected && (
                          <span
                            style={{
                              marginLeft: 6,
                              background: 'rgba(16,185,129,0.12)',
                              color: '#059669',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: 4,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
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
                <div className={styles.addressCheck} style={{ fontSize: '1rem', border: 'none', color: '#10b981' }}>
                  +
                </div>
                <div className={styles.addressInfo}>
                  <p className={styles.addressLabel}>
                    <strong style={{ color: '#10b981' }}>Add New Address</strong>
                  </p>
                  <p className={styles.addressTextSmall}>Save a new delivery location</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Delivery instructions (shown when an address is selected) ── */}
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

        {/* ── Empty state ── */}
        {!loading && addresses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📍</div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>No saved addresses yet</p>
            <p style={{ fontSize: '0.88rem' }}>Click &quot;Add New Address&quot; above to get started.</p>
          </div>
        )}
      </div>

      {/* ── Footer CTA ── */}
      <footer className={styles.footer}>
        <button
          className={styles.ctaBtn}
          onClick={handleContinue}
          disabled={loading || (!selectedId && addresses.length > 0)}
        >
          {loading ? (
            <>
              <div className={styles.spinner} />
              Loading...
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

      {/* ── Add New Address Modal ── */}
      {showModal && (
        <AddressModal
          onClose={() => setShowModal(false)}
          onSave={handleAddNew}
          saving={saving}
        />
      )}
    </>
  );
}
