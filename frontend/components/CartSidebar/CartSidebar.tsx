import React, { useState } from 'react';
import { CartItem } from '../../types';
import { calcItemUnitPrice } from '../../contexts/CartContext';
import styles from './CartSidebar.module.css';

interface CartSidebarProps {
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onClearCart: () => void;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({ cart, onUpdateQuantity, onClearCart, onClose, onCheckout }: CartSidebarProps) {
  const subtotal = cart.reduce((sum, item) => sum + calcItemUnitPrice(item) * item.quantity, 0);

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on header
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      className={styles.popup}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div 
        className={styles.header}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <h2 className={styles.title}>Your Cart</h2>
        <div className={styles.headerActions}>
          {cart.length > 0 && (
            <button className={styles.clearBtn} onClick={onClearCart} title="Clear Cart">
              Clear
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose} title="Close Cart">&times;</button>
        </div>
      </div>
      
      <div className={styles.cartItems}>
        {cart.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛒</div>
            <p>Your cart is empty</p>
            <button className={styles.continueBtn} onClick={onClose}>Continue Shopping</button>
          </div>
        ) : (
          cart.map((item, index) => (
            <div key={`${item.id}-${index}`} className={styles.cartItem}>
              <div className={styles.itemImgWrap}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className={styles.itemImg} />
                ) : (
                  <div className={styles.itemImgPlaceholder}>🍽️</div>
                )}
                <span className={styles.qtyBadge}>{item.quantity}</span>
              </div>
              
              <div className={styles.itemMain}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>£{(calcItemUnitPrice(item) * item.quantity).toFixed(2)}</span>
                </div>
                
                {item.selectedExtraOptions && item.selectedExtraOptions.length > 0 && (
                  <div className={styles.itemOptions}>
                    {item.selectedExtraOptions.map((opt, i) => (
                      <span key={i} className={styles.fillingBadge}>
                        ➕ {opt.name}{opt.price > 0 ? ` (+£${opt.price.toFixed(2)})` : ''}
                      </span>
                    ))}
                  </div>
                )}

                {item.spiceLevel && (
                  <div className={styles.itemOptions}>
                    <span className={styles.spiceBadge}>
                      {item.spiceLevel === 'Normal' ? '🌶️' : item.spiceLevel === 'Hot' ? '🌶️🌶️' : '🌶️🌶️🌶️'} {item.spiceLevel}
                    </span>
                  </div>
                )}
                
                {item.description && (
                  <p className={styles.itemDesc}>{item.description}</p>
                )}

                <div className={styles.itemActions}>
                  <div className={styles.quantityControls}>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => onUpdateQuantity(index, -1)}
                      aria-label="Decrease quantity"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14"/></svg>
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => onUpdateQuantity(index, 1)}
                      aria-label="Increase quantity"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Total</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        <button className={styles.checkoutBtn} disabled={cart.length === 0} onClick={onCheckout}>
          Checkout
        </button>
      </div>
    </div>
  );
}
