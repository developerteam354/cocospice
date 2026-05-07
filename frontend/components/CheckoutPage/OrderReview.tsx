'use client';

import React, { useState } from 'react';
import { CartItem } from '../../types';
import { useCart } from '../../contexts/CartContext';
import styles from './CheckoutPage.module.css';

const DELIVERY_FEE = 2.99;

interface OrderReviewProps {
  cart: CartItem[];
  note: string;
  onNoteChange: (note: string) => void;
}

export default function OrderReview({ cart, note, onNoteChange }: OrderReviewProps) {
  const { orderType } = useCart();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNote, setTempNote] = useState(note);
  const [hasSavedNote, setHasSavedNote] = useState(note.length > 0);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + (orderType === 'delivery' ? DELIVERY_FEE : 0);

  const handleSaveNote = () => {
    onNoteChange(tempNote);
    setHasSavedNote(tempNote.trim().length > 0);
    setIsEditingNote(false);
  };

  const handleEditNote = () => {
    setIsEditingNote(true);
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Your Order</h2>

      <div className={styles.itemList}>
        {cart.map((item, index) => (
          <div key={`${item.id}-${index}`} className={styles.orderItem}>
            <div className={styles.itemImgWrap}>
              {item.image
                ? <img src={item.image} alt={item.name} className={styles.itemImg} />
                : <div className={styles.itemImgPlaceholder}>🍽️</div>
              }
              <span className={styles.qtyBadge}>{item.quantity}</span>
            </div>
            <div className={styles.itemDetails}>
              <span className={styles.itemName}>{item.name}</span>
              {item.selectedExtraOptions && item.selectedExtraOptions.length > 0 && (
                <div className={styles.itemOptions}>
                  {item.selectedExtraOptions.map((opt) => (
                    <span key={opt.name} className={styles.optionBadge}>
                      {opt.name}{opt.price > 0 ? ` (+£${opt.price.toFixed(2)})` : ''}
                    </span>
                  ))}
                </div>
              )}
              <span className={styles.itemDesc}>{item.description}</span>
              <span className={styles.itemUnit}>£{item.price.toFixed(2)} each</span>
            </div>
            <div className={styles.itemTotal}>£{(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Order Note Section */}
      <div className={styles.noteSection}>
        {!hasSavedNote && !isEditingNote ? (
          <button 
            className={styles.addNoteBtn} 
            onClick={() => setIsEditingNote(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Add special instructions
          </button>
        ) : isEditingNote ? (
          <div className={styles.noteInputArea}>
            <div className={styles.noteHeader}>
              <span className={styles.noteTitle}>Order Instructions</span>
              <button className={styles.noteClose} onClick={() => setIsEditingNote(false)}>&times;</button>
            </div>
            <textarea
              className={styles.noteTextarea}
              placeholder="E.g. No onions please, or Leave at the door"
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              autoFocus
            />
            <div className={styles.noteActions}>
              <button className={styles.noteCancelBtn} onClick={() => setIsEditingNote(false)}>Cancel</button>
              <button className={styles.noteSaveBtn} onClick={handleSaveNote}>Save Note</button>
            </div>
          </div>
        ) : (
          <div className={styles.savedNoteArea}>
            <div className={styles.savedNoteContent}>
              <div className={styles.noteTitleArea}>
                <span className={styles.noteTitle}>Your Instructions</span>
                <button className={styles.editNoteBtn} onClick={handleEditNote}>Edit</button>
              </div>
              <p className={styles.savedNoteText}>{note}</p>
            </div>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className={styles.totalsCard}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        {orderType === 'delivery' && (
          <div className={styles.totalRow}>
            <span>Delivery fee</span>
            <span>£{DELIVERY_FEE.toFixed(2)}</span>
          </div>
        )}
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
