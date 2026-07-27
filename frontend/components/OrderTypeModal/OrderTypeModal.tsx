import React from 'react';
import styles from './OrderTypeModal.module.css';

interface OrderTypeModalProps {
  onSelectType: (type: 'delivery' | 'collection') => void;
  onClose: () => void;
  isCollectionEnabled?: boolean;
  isDeliveryEnabled?: boolean;
}

export default function OrderTypeModal({ 
  onSelectType, 
  onClose, 
  isCollectionEnabled = true, 
  isDeliveryEnabled = true 
}: OrderTypeModalProps) {
  const bothDisabled = !isCollectionEnabled && !isDeliveryEnabled;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          {bothDisabled ? 'Service Unavailable' : 'How would you like your order?'}
        </h2>
        
        {bothDisabled ? (
          <div className={styles.unavailableMessage}>
            <div className={styles.unavailableIcon}>🔒</div>
            <p className={styles.unavailableText}>
              We are currently not accepting any online orders at the moment.
            </p>
            <p className={styles.unavailableSubtext}>
              Please check back later or contact us directly.
            </p>
          </div>
        ) : (
          <div className={styles.options}>
            <button 
              className={`${styles.optionBtn} ${styles.delivery} ${!isDeliveryEnabled ? styles.disabled : ''}`} 
              onClick={() => isDeliveryEnabled && onSelectType('delivery')}
              disabled={!isDeliveryEnabled}
            >
              <div className={styles.icon}>🛵</div>
              <div className={styles.textWrap}>
                <span className={styles.mainText}>Delivery</span>
                <span className={styles.subText}>
                  {isDeliveryEnabled 
                    ? 'Delivered fresh to your door' 
                    : 'Currently unavailable'}
                </span>
              </div>
              {!isDeliveryEnabled && (
                <div className={styles.disabledBadge}>Disabled</div>
              )}
            </button>
            
            <button 
              className={`${styles.optionBtn} ${styles.collection} ${!isCollectionEnabled ? styles.disabled : ''}`} 
              onClick={() => isCollectionEnabled && onSelectType('collection')}
              disabled={!isCollectionEnabled}
            >
              <div className={styles.icon}>🛍️</div>
              <div className={styles.textWrap}>
                <span className={styles.mainText}>Collection</span>
                <span className={styles.subText}>
                  {isCollectionEnabled 
                    ? 'Pick up at 370 High Street' 
                    : 'Currently unavailable'}
                </span>
              </div>
              {!isCollectionEnabled && (
                <div className={styles.disabledBadge}>Disabled</div>
              )}
            </button>
          </div>
        )}

        <button className={styles.closeBtn} onClick={onClose}>
          {bothDisabled ? 'Close' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
