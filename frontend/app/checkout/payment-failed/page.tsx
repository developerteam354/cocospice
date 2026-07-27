'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './PaymentFailed.module.css';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Your payment could not be processed.');

  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) setMessage(decodeURIComponent(msg));
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        {/* Icon */}
        <div className={styles.iconWrap}>
          <svg className={styles.icon} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="25" stroke="#ef4444" strokeWidth="2.5" />
            <path d="M16 16 L36 36 M36 16 L16 36" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className={styles.title}>Payment Failed</h1>

        <p className={styles.message}>{message}</p>

        <div className={styles.tips}>
          <p className={styles.tipsHeading}>Common reasons:</p>
          <ul className={styles.tipsList}>
            <li>Insufficient funds on the card</li>
            <li>Card details entered incorrectly</li>
            <li>Card declined by your bank</li>
            <li>3D Secure authentication was cancelled</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Link href="/checkout/payment" className={styles.retryBtn}>
            Try Again
          </Link>
          <Link href="/menu" className={styles.homeBtn}>
            Back to Menu
          </Link>
        </div>

        <p className={styles.support}>
          Need help?{' '}
          <Link href="/contact" className={styles.supportLink}>
            Contact Support
          </Link>
        </p>

      </div>
    </div>
  );
}
