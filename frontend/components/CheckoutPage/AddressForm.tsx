'use client';

import React from 'react';
import styles from './CheckoutPage.module.css';

/* ─── Types ─────────────────────────────────── */
export interface Address {
  id?: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  phone: string;
  instructions?: string;
}

export const EMPTY_ADDRESS: Address = {
  fullName: '', line1: '', line2: '', city: '',
  postcode: '', phone: '', instructions: '',
};

interface AddressFormProps {
  address: Address;
  errors: Partial<Address>;
  onChange: (field: keyof Address, value: string) => void;
}

export default function AddressForm({ address, errors, onChange }: AddressFormProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Delivery Address</h2>

      <div className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Full Name</label>
          <input
            className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
            placeholder="Jane Smith"
            value={address.fullName}
            onChange={e => onChange('fullName', e.target.value)}
          />
          {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Address Line 1</label>
          <input
            className={`${styles.input} ${errors.line1 ? styles.inputError : ''}`}
            placeholder="123 High Street"
            value={address.line1}
            onChange={e => onChange('line1', e.target.value)}
          />
          {errors.line1 && <span className={styles.error}>{errors.line1}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Address Line 2 <span className={styles.optional}>(optional)</span>
          </label>
          <input
            className={styles.input}
            placeholder="Flat 4B"
            value={address.line2}
            onChange={e => onChange('line2', e.target.value)}
          />
        </div>

        <div className={styles.row2}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>City</label>
            <input
              className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
              placeholder="Lincoln"
              value={address.city}
              onChange={e => onChange('city', e.target.value)}
            />
            {errors.city && <span className={styles.error}>{errors.city}</span>}
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Postcode</label>
            <input
              className={`${styles.input} ${errors.postcode ? styles.inputError : ''}`}
              placeholder="LN5 7RU"
              value={address.postcode}
              onChange={e => onChange('postcode', e.target.value.toUpperCase())}
            />
            {errors.postcode && <span className={styles.error}>{errors.postcode}</span>}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Phone Number</label>
          <input
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            placeholder="+44 7700 900000"
            type="tel"
            value={address.phone}
            onChange={e => onChange('phone', e.target.value)}
          />
          {errors.phone && <span className={styles.error}>{errors.phone}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Delivery Instructions <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            placeholder="Leave at door, ring bell twice…"
            rows={3}
            value={address.instructions}
            onChange={e => onChange('instructions', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
