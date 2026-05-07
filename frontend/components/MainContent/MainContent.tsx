import React from 'react';
import { MenuItem, Category } from '../../types';
import styles from './MainContent.module.css';

interface MainContentProps {
  categoryTitle: string;
  items: MenuItem[];
  categories?: Category[];
  onSelectCategory?: (id: string) => void;
  onAddToCart: (item: MenuItem) => void;
  onSelectItem?: (item: MenuItem) => void;
}

export default function MainContent({ categoryTitle, items, categories, onSelectCategory, onAddToCart, onSelectItem }: MainContentProps) {
  // Category Grid View
  if (categories && onSelectCategory) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.categoryGrid}>
          {categories.map((cat, index) => {
            return (
              <div
                key={cat.id}
                className={styles.categoryItem}
                onClick={() => onSelectCategory(cat.id)}
              >
                {cat.categoryImage ? (
                  <img
                    src={cat.categoryImage}
                    alt={cat.name}
                    width={100}
                    height={100}
                    className={styles.categoryItemImage}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: 100, 
                    height: 100, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '3rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px'
                  }}>
                    🍽️
                  </div>
                )}
                <span style={{ color: '#000000', fontSize: '1rem', fontWeight: 'bold' }}>{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Product List View
  return (
    <div className={styles.mainContent}>
      <h2 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '16px', paddingBottom: '8px', borderBottom: '3px solid #004d80', display: 'inline-block' }}>{categoryTitle}</h2>
      <div className={styles.productList}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={styles.productItem}
            style={{ animationDelay: `${index * 0.08}s`, cursor: onSelectItem ? 'pointer' : 'default' }}
            onClick={() => onSelectItem && onSelectItem(item)}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                width={100}
                height={100}
                className={styles.productImage}
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div 
              className="fallback-icon hidden" 
              style={{ 
                width: 100, 
                height: 100, 
                display: item.image ? 'none' : 'flex',
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                fontSize: '3rem'
              }}
            >
              🍽️
            </div>
            <div className={styles.productInfo}>
              <h3 style={{ color: '#000000', fontWeight: 'bold', margin: '0 0 4px 0', fontSize: '1.1rem' }}>{item.name}</h3>
              {item.description && <p style={{ color: '#000000', margin: '0 0 8px 0', fontSize: '0.85rem' }}>{item.description}</p>}
              <p style={{ color: '#000000', margin: '0', fontSize: '1.1rem', fontWeight: '800' }}>£{item.price.toFixed(2)}</p>
            </div>
            <button className={styles.addBtn} onClick={(e) => { e.stopPropagation(); onAddToCart(item); }} title="Add to Cart">
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
