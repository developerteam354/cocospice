'use client';

import React, { useState, useEffect } from 'react';
import { SavedAddress } from '../../types';
import styles from './AddressModal.module.css';

interface AddressModalProps {
  address?: SavedAddress;
  onClose: () => void;
  onSave: (address: SavedAddress) => void;
  saving?: boolean;
}

type FormFields = Omit<SavedAddress, 'id'>;
type FieldErrors = Partial<Record<keyof FormFields, string>>;

const EMPTY_FORM: FormFields = {
  label:     '',
  fullName:  '',
  line1:     '',
  line2:     '',
  city:      '',
  postcode:  '',
  phone:     '',
  isDefault: false,
};

// Required fields and their human-readable names
const REQUIRED: Array<{ key: keyof FormFields; label: string }> = [
  { key: 'label',    label: 'Address label' },
  { key: 'fullName', label: 'Full name' },
  { key: 'line1',    label: 'Address line 1' },
  { key: 'city',     label: 'City' },
  { key: 'postcode', label: 'Postcode' },
  { key: 'phone',    label: 'Phone number' },
];

export default function AddressModal({
  address,
  onClose,
  onSave,
  saving = false,
}: AddressModalProps) {
  const [formData, setFormData] = useState<FormFields>(EMPTY_FORM);
  const [errors,   setErrors]   = useState<FieldErrors>({});
  const [touched,  setTouched]  = useState<Partial<Record<keyof FormFields, boolean>>>({});

  // Pre-fill when editing
  useEffect(() => {
    if (address) {
      setFormData({
        label:     address.label,
        fullName:  address.fullName,
        line1:     address.line1,
        line2:     address.line2 || '',
        city:      address.city,
        postcode:  address.postcode,
        phone:     address.phone,
        isDefault: address.isDefault || false,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
    setTouched({});
  }, [address]);

  // Validate a single field
  const validateField = (key: keyof FormFields, value: string | boolean): string => {
    const req = REQUIRED.find(r => r.key === key);
    if (req && typeof value === 'string' && !value.trim()) {
      return `${req.label} is required`;
    }
    if (key === 'phone' && typeof value === 'string' && value.trim()) {
      if (!/^[\d\s+\-()]{7,15}$/.test(value.trim())) {
        return 'Enter a valid phone number';
      }
    }
    return '';
  };

  // Validate all fields and return errors map
  const validateAll = (): FieldErrors => {
    const errs: FieldErrors = {};
    REQUIRED.forEach(({ key }) => {
      const msg = validateField(key, formData[key] as string);
      if (msg) errs[key] = msg;
    });
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const key = name as keyof FormFields;
    const val = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [key]: val }));

    // Clear error as user types
    if (touched[key]) {
      const msg = validateField(key, val as string | boolean);
      setErrors(prev => ({ ...prev, [key]: msg }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const key = e.target.name as keyof FormFields;
    setTouched(prev => ({ ...prev, [key]: true }));
    const msg = validateField(key, formData[key] as string | boolean);
    setErrors(prev => ({ ...prev, [key]: msg }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all required fields as touched
    const allTouched: Partial<Record<keyof FormFields, boolean>> = {};
    REQUIRED.forEach(({ key }) => { allTouched[key] = true; });
    setTouched(allTouched);

    const errs = validateAll();
    setErrors(errs);

    if (Object.keys(errs).length > 0) return; // stop if invalid

    onSave({
      ...formData,
      id: address?.id || Math.random().toString(36).substr(2, 9),
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Helper: input class with error state
  const inputCls = (key: keyof FormFields) =>
    `${styles.input} ${errors[key] ? styles.inputError : ''}`;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>{address ? 'Edit Address' : 'Add New Address'}</h2>
          <p className={styles.subtitle}>Enter your delivery details below</p>
        </div>

        {/* noValidate disables browser native tooltips */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* Address Label */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Address Label <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="label"
              placeholder="e.g. Home, Office"
              className={inputCls('label')}
              value={formData.label}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
            />
            {errors.label && <span className={styles.errorMsg}>{errors.label}</span>}
          </div>

          {/* Full Name */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Full Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              className={inputCls('fullName')}
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
            />
            {errors.fullName && <span className={styles.errorMsg}>{errors.fullName}</span>}
          </div>

          {/* Address Line 1 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Address Line 1 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="line1"
              placeholder="370 High Street"
              className={inputCls('line1')}
              value={formData.line1}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="address-line1"
            />
            {errors.line1 && <span className={styles.errorMsg}>{errors.line1}</span>}
          </div>

          {/* Address Line 2 (optional) */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Address Line 2 <span className={styles.optional}>(Optional)</span></label>
            <input
              type="text"
              name="line2"
              placeholder="Apartment, suite, etc."
              className={styles.input}
              value={formData.line2}
              onChange={handleChange}
              autoComplete="address-line2"
            />
          </div>

          {/* City + Postcode */}
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                City <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="city"
                placeholder="Lincoln"
                className={inputCls('city')}
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="address-level2"
              />
              {errors.city && <span className={styles.errorMsg}>{errors.city}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Postcode <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="postcode"
                placeholder="LN5 7RU"
                className={inputCls('postcode')}
                value={formData.postcode}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="postal-code"
              />
              {errors.postcode && <span className={styles.errorMsg}>{errors.postcode}</span>}
            </div>
          </div>

          {/* Phone */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Phone Number <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="+44 7700 900000"
              className={inputCls('phone')}
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="tel"
            />
            {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
          </div>

          {/* Default checkbox */}
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              className={styles.checkbox}
              checked={formData.isDefault}
              onChange={handleChange}
            />
            <label htmlFor="isDefault" className={styles.checkboxLabel}>
              Set as default delivery address
            </label>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Saving...' : address ? 'Update Address' : 'Save Address'}
          </button>
        </form>
      </div>
    </div>
  );
}
