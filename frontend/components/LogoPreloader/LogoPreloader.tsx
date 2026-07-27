'use client';

import React from 'react';
import styles from './LogoPreloader.module.css';

export default function LogoPreloader() {
  return (
    <div className={styles.preloaderContainer}>
      <div className={styles.logoWrapper}>
        <div className={styles.logoCircle}>
          <img 
            src="/coco__logo.png" 
            alt="CoCo Spice Loading" 
            className={styles.logo}
          />
        </div>
        <h1 className={styles.brandName}>
          COCO <span className={styles.brandAccent}>SPICE</span>
        </h1>
        <div className={styles.loadingDots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
