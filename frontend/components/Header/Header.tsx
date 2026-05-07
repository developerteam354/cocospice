'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

// ─── Proxy URL helper ─────────────────────────────────────────────────────────
const toProxyUrl = (urlOrKey: string): string => {
  if (!urlOrKey) return '';
  if (urlOrKey.includes('/upload/image')) return urlOrKey;
  const s3Match = urlOrKey.match(/amazonaws\.com\/(.+)$/);
  const key = s3Match ? s3Match[1] : urlOrKey;
  return `${process.env.NEXT_PUBLIC_API_URL}/api/user/upload/image?key=${encodeURIComponent(key)}`;
};

// ─── Avatar sub-component ─────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  profileImage?: string;
  size?: number;
  fontSize?: string;
}

function Avatar({ name, profileImage, size = 40, fontSize = '0.85rem' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const proxyUrl = profileImage ? toProxyUrl(profileImage) : '';

  useEffect(() => { setImgError(false); }, [profileImage]);

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div 
      className="flex items-center justify-center rounded-full shrink-0 font-extrabold text-white border-2 border-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] overflow-hidden bg-gradient-to-br from-[#10b981] to-[#059669]"
      style={{ width: size, height: size, fontSize }}
    >
      {proxyUrl && !imgError ? (
        <img
          src={proxyUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onOpenAuth }) => {
  const { logout } = useAuth();
  const router = useRouter();
  const reduxUser = useAppSelector((s: RootState) => s.userAuth.user);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu,   setShowUserMenu]   = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        @keyframes custom-marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .animate-custom-marquee {
          animation: custom-marquee 25s linear infinite;
        }
      `}</style>

      <header className="sticky top-0 z-[100] w-full flex flex-col bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        
        {/* ── Marquee Top Bar ── */}
        <div className="bg-[#10b981] py-2 px-6 text-[0.8rem] text-white font-semibold flex items-center overflow-hidden w-full shadow-[0_2px_10px_rgba(16,185,129,0.2)]">
          <div className="flex gap-8 items-center animate-custom-marquee whitespace-nowrap min-w-full">
            <span className="flex items-center gap-1.5 drop-shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              370 High Street, Lincoln LN5 7RU
            </span>
            <span className="flex items-center gap-1.5 drop-shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              01522 534 202
            </span>
            <span className="bg-white text-[#10b981] px-4 py-1 rounded-full font-black uppercase tracking-widest text-[0.65rem] shadow-[0_0_15px_rgba(255,255,255,0.4)] border-2 border-white animate-pulse">
              We are now open
            </span>
          </div>
        </div>

        {/* ── Main Header ── */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] sm:h-[84px] flex justify-between items-center gap-4">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 group">
            <div className="w-[42px] h-[42px] sm:w-[48px] sm:h-[48px] rounded-[14px] bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
              <span className="text-[1.3rem] sm:text-[1.5rem]">🍛</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[1.4rem] sm:text-[1.7rem] font-black text-gray-900 leading-[1.1] font-serif tracking-tight">
                Coco<span className="text-[#10b981]">spice</span>
              </h1>
              <p className="text-[0.6rem] sm:text-[0.65rem] font-bold text-gray-500 tracking-[0.2em] uppercase mt-[2px] hidden sm:block">
                Indian Cuisine
              </p>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
            <a href="/" className="px-5 py-2 rounded-[12px] bg-white text-[#10b981] font-extrabold text-[0.9rem] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              Menu
            </a>
            <a href="#" className="px-5 py-2 rounded-[12px] text-gray-600 font-bold text-[0.9rem] hover:bg-gray-100/80 transition-colors">
              About
            </a>
            <a href="#" className="px-5 py-2 rounded-[12px] text-gray-600 font-bold text-[0.9rem] hover:bg-gray-100/80 transition-colors">
              Contact
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Cart Button */}
            <button 
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 sm:px-5 py-[10px] sm:py-[12px] rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shadow-[0_6px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.35)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span className="font-bold text-[0.9rem] hidden sm:block tracking-wide">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ef4444] text-white text-[0.7rem] font-black w-[22px] h-[22px] rounded-full flex items-center justify-center border-[2.5px] border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User area */}
            {reduxUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => {
                    if (window.innerWidth <= 768) router.push('/profile');
                    else setShowUserMenu(!showUserMenu);
                  }}
                  className="rounded-full p-0.5 border-[2.5px] border-transparent hover:border-[#10b981]/30 transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center"
                  aria-label="User menu"
                >
                  <Avatar name={reduxUser.name} profileImage={reduxUser.profileImage} size={window.innerWidth <= 768 ? 38 : 44} />
                </button>

                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-[calc(100%+8px)] w-[280px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.12)] border border-gray-100 p-2 z-[200]"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 p-3">
                        <Avatar name={reduxUser.name} profileImage={reduxUser.profileImage} size={48} fontSize="1rem" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[0.95rem] text-gray-900 truncate">{reduxUser.name}</span>
                          <span className="text-[0.8rem] text-gray-500 font-medium truncate">{reduxUser.email}</span>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100 mx-2 my-1" />

                      {/* Items */}
                      <div className="flex flex-col gap-1 p-1">
                        <button
                          onClick={() => { setShowUserMenu(false); router.push('/profile'); }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-700 font-bold text-[0.9rem] hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          </div>
                          My Dashboard
                        </button>
                        
                        <button
                          onClick={() => { setShowUserMenu(false); router.push('/profile/orders'); }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-700 font-bold text-[0.9rem] hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#10b981]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                          </div>
                          My Orders
                        </button>
                      </div>

                      <div className="h-px bg-gray-100 mx-2 my-1" />

                      <div className="p-1">
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 font-bold text-[0.9rem] hover:bg-red-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50/50 flex items-center justify-center text-red-500">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          </div>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => onOpenAuth('login')}
                className="hidden sm:flex items-center gap-2 px-4 py-[10px] rounded-xl border-[2px] border-gray-200 text-gray-700 font-bold text-[0.9rem] hover:border-[#10b981] hover:text-[#10b981] hover:bg-emerald-50/50 transition-all duration-200 active:scale-95 bg-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Sign In
              </button>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex md:hidden flex-col justify-center items-center gap-[4.5px] w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 transition-all active:bg-gray-100 z-50"
              aria-label="Toggle menu"
            >
              <span className={`w-[18px] h-[2px] bg-gray-700 rounded-full transition-all duration-300 ${showMobileMenu ? 'translate-y-[6.5px] rotate-45' : ''}`} />
              <span className={`w-[18px] h-[2px] bg-gray-700 rounded-full transition-all duration-300 ${showMobileMenu ? 'opacity-0' : ''}`} />
              <span className={`w-[18px] h-[2px] bg-gray-700 rounded-full transition-all duration-300 ${showMobileMenu ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden bg-white border-t border-gray-100 shadow-lg"
            >
              <nav className="flex flex-col p-4 gap-2">
                <a href="/" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 text-[#10b981] font-bold text-[0.95rem]">
                  <span className="text-[1.2rem]">🍽️</span> Menu
                </a>
                
                {reduxUser && (
                  <>
                    <button onClick={() => { setShowMobileMenu(false); router.push('/profile'); }} className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 font-bold text-[0.95rem] text-left">
                      <span className="text-[1.2rem]">👤</span> My Dashboard
                    </button>
                    <button onClick={() => { setShowMobileMenu(false); router.push('/profile/orders'); }} className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 font-bold text-[0.95rem] text-left">
                      <span className="text-[1.2rem]">📦</span> My Orders
                    </button>
                    <button onClick={() => { setShowMobileMenu(false); router.push('/profile/address'); }} className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 font-bold text-[0.95rem] text-left">
                      <span className="text-[1.2rem]">📍</span> Manage Address
                    </button>
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    <button onClick={() => { logout(); setShowMobileMenu(false); }} className="flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 font-bold text-[0.95rem] text-left">
                      <span className="text-[1.2rem]">🚪</span> Sign Out
                    </button>
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                  </>
                )}

                <a href="#" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 font-bold text-[0.95rem]">
                  <span className="text-[1.2rem]">ℹ️</span> About
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 font-bold text-[0.95rem]">
                  <span className="text-[1.2rem]">📞</span> Contact
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;

