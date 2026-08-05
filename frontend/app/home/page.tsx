'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UtensilsCrossed, Package, BookOpen } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { fetchShopStatus, type ShopStatusResponse } from '@/services/shopService';

export default function HomePage() {
  const [shopStatus, setShopStatus] = useState<ShopStatusResponse | null>(null);

  // Fetch shop status on mount and poll every 15 seconds
  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      try {
        const status = await fetchShopStatus();
        if (!cancelled) {
          console.log('🏠 [Home Page] Shop Status Updated:', status);
          setShopStatus(status);
        }
      } catch (error) {
        console.error('❌ [Home Page] Failed to fetch shop status:', error);
      }
    };

    load();
    const interval = setInterval(load, 15_000);

    // Re-fetch when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ [Home Page] Tab visible - refreshing shop status');
        load();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header 
        cartCount={0} 
        onOpenCart={() => {}} 
        onOpenAuth={() => {}}
        shopStatus={shopStatus}
        activePage="home"
      />

      {/* Hero Section with Background Image */}
      <section className="relative min-h-[600px] sm:min-h-[700px] lg:min-h-[800px] text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/images/bg-food.png" 
            alt="Delicious Indian Food" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/60" />
        </div>

        {/* Animated Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[600px] sm:min-h-[700px] lg:min-h-[800px] flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center w-full"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-8 overflow-hidden bg-white shadow-[0_10px_40px_rgba(128,45,0,0.3)]"
            >
              <img 
                src="/coco__logo.png" 
                alt="COCO SPICE Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </motion.div>

            {/* Brand Name with Gradient Animation */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tight cocospice-brand"
              style={{ 
                fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif", 
                background: 'linear-gradient(90deg, #f6eada 0%, #802d00 50%, #f6eada 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
                letterSpacing: '0.1em',
                textShadow: 'none'
              }}
            >
              COCO SPICE
            </motion.h1>
            <style jsx>{`
              @keyframes shimmer {
                0% {
                  background-position: 200% center;
                }
                100% {
                  background-position: -200% center;
                }
              }
            `}</style>
            
            {/* Tagline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
              style={{ color: '#802d00' }}
            >
              Where Tradition Meets Flavor
            </motion.p>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
            >
              Experience the authentic taste of India with our handcrafted dishes, prepared fresh daily using traditional recipes and premium ingredients
            </motion.p>

            {/* CTA Button */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              href="/menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-lg rounded-2xl shadow-[0_8px_30px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.7)] transition-all"
            >
              Explore Our Menu
              <ArrowRight className="w-6 h-6" />
            </motion.a>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full h-auto">
            <path fill="#f9fafb" fillOpacity="1" d="M0,32L60,37.3C120,43,240,53,360,58.7C480,64,600,64,720,58.7C840,53,960,43,1080,42.7C1200,43,1320,53,1380,58.7L1440,64L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"></path>
          </svg>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="flex-1 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Our Food Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="group relative bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="relative p-8 sm:p-12">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UtensilsCrossed className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                  Our Food
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Discover a world of authentic Indian flavors. From aromatic curries to sizzling tandoori dishes, 
                  our menu features time-honored recipes prepared with the finest ingredients and traditional techniques.
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold">50+ Authentic Dishes</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold">Vegetarian & Vegan Options</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold">Halal Certified</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold">Custom Spice Levels</span>
                  </li>
                </ul>

                {/* CTA Button */}
                <a
                  href="/menu"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                >
                  View Menu
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Decorative Element */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
            </motion.div>

            {/* Our Services Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="group relative bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/10 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="relative p-8 sm:p-12">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                  Our Services
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  We make it easy to enjoy your favorite dishes. Whether you prefer delivery to your door, 
                  quick self-collection, or dining with us, we've got you covered with flexible service options.
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold">Free Delivery (7 Miles Radius)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold">Quick Self-Collection</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="font-semibold text-gray-500">Dine-in <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Coming Soon</span></span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="font-semibold text-gray-500">Third-Party Delivery <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Coming Soon</span></span>
                  </li>
                </ul>

                {/* CTA Button */}
                <a
                  href="/services"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                >
                  Explore Our Services
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Decorative Element */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
            </motion.div>

          </div>

          {/* Our Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 sm:mt-24"
          >
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 rounded-3xl p-10 sm:p-16 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
              <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
              
              <div className="relative text-center max-w-4xl mx-auto">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6 border border-white/20">
                  <BookOpen className="w-8 h-8 text-emerald-400" />
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
                  Our Story
                </h2>

                {/* Story Content */}
                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-8">
                  Founded with a passion for authentic Indian cuisine, Cocospice has been bringing the rich flavors and 
                  traditions of India to Lincoln. Our journey began with a simple vision: to create unforgettable dining 
                  experiences through carefully crafted dishes that honor centuries-old recipes while embracing modern 
                  culinary innovation. Every dish tells a story, every spice serves a purpose, and every meal is prepared 
                  with love and dedication by our expert chefs.
                </p>

                {/* CTA Button */}
                <a
                  href="/about"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <BookOpen className="w-5 h-5" />
                  More About Us
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
