'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Award, Users, Leaf, Clock, Star, ChefHat, Sparkles } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { fetchShopStatus, type ShopStatusResponse } from '@/services/shopService';

export default function AboutPage() {
  const [shopStatus, setShopStatus] = useState<ShopStatusResponse | null>(null);

  // Fetch shop status on mount
  useEffect(() => {
    fetchShopStatus()
      .then(setShopStatus)
      .catch(() => {});
  }, []);
  const values = [
    {
      icon: Heart,
      title: 'Passion for Food',
      description: 'Every dish is crafted with love and dedication to authentic Indian flavors',
      color: 'from-[#802d00] to-[#504008]',
    },
    {
      icon: Award,
      title: 'Quality Ingredients',
      description: 'We source the finest spices and freshest ingredients for exceptional taste',
      color: 'from-[#504008] to-[#322511]',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building lasting relationships with our customers and local community',
      color: 'from-[#802d00] to-[#504008]',
    },
    {
      icon: Leaf,
      title: 'Sustainable Practices',
      description: 'Committed to eco-friendly operations and supporting local suppliers',
      color: 'from-[#504008] to-[#322511]',
    },
  ];

  const stats = [
    { number: '10+', label: 'Years Experience', icon: Clock },
    { number: '50+', label: 'Menu Items', icon: ChefHat },
    { number: '5000+', label: 'Happy Customers', icon: Users },
    { number: '4.8', label: 'Average Rating', icon: Star },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header 
        cartCount={0} 
        onOpenCart={() => {}} 
        onOpenAuth={() => {}}
        shopStatus={shopStatus}
        activePage="about"
      />

      {/* Hero Section - Vertical Centered Layout */}
      <section className="relative bg-[#322511] text-[#f6eada] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(246, 234, 218, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#802d00]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#504008]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Centered Vertical Layout */}
          <div className="text-center">
            
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white mb-8 shadow-[0_10px_40px_rgba(128,45,0,0.4)] overflow-hidden"
            >
              <img 
                src="/coco__logo.png" 
                alt="COCO SPICE Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </motion.div>
            
            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight cocospice-brand" 
              style={{
                fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif",
                color: '#802d00',
                letterSpacing: '0.05em'
              }}
            >
              ABOUT US
            </motion.h1>
            
            {/* Brand Name */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-3xl sm:text-4xl font-black mb-6 cocospice-brand" 
              style={{
                fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif",
                color: '#f6eada',
                letterSpacing: '0.08em'
              }}
            >
              COCO SPICE
            </motion.h2>
            
            {/* Tagline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-xl sm:text-2xl text-[#802d00] font-bold mb-12 max-w-3xl mx-auto"
            >
              Where Every Bite Becomes a Memorable Experience
            </motion.p>

            {/* About Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="space-y-6 text-[#f6eada] leading-relaxed text-lg">
                <p>
                  Welcome to <strong className="cocospice-brand" style={{fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif", color: '#802d00'}}>COCO SPICE</strong>, where authentic Indian cuisine meets warm hospitality in the heart of Lincoln.
                </p>
                <p>
                  Our journey is rooted in the rich culinary traditions of Kerala and the wider flavors of India, bringing you dishes that tell stories of spice, culture, and tradition.
                </p>
                <p>
                  From comforting Kerala curries to aromatic biryanis and tandoori favorites, every meal is crafted with passion, using carefully selected ingredients and time-honored cooking techniques.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full h-auto">
            <path fill="#f6eada" fillOpacity="1" d="M0,32L60,37.3C120,43,240,53,360,58.7C480,64,600,64,720,58.7C840,53,960,43,1080,42.7C1200,43,1320,53,1380,58.7L1440,64L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"></path>
          </svg>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1 bg-[#f6eada]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          
          {/* Story Section */}
          {/* Welcome Box at Top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#802d00] to-[#504008] rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-gradient-to-br from-[#322511] via-[#1a1308] to-[#322511] rounded-3xl p-10 sm:p-16 shadow-2xl border border-[#802d00]/20">
                {/* Logo */}
                <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_10px_40px_rgba(128,45,0,0.4)]">
                  <img 
                    src="/coco__logo.png" 
                    alt="COCO SPICE Logo" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                
                {/* Title */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 text-center" style={{
                  fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif",
                  letterSpacing: '0.05em'
                }}>
                  Welcome to <span style={{ color: '#802d00' }}>COCO SPICE</span>
                </h2>
                
                {/* Tagline */}
                <p className="text-xl sm:text-2xl text-[#f6eada]/90 leading-relaxed text-center max-w-3xl mx-auto">
                  Where tradition meets innovation in every bite
                </p>

                {/* Decorative Line */}
                <div className="mt-8 flex items-center justify-center gap-3">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#802d00]" />
                  <div className="w-2 h-2 rounded-full bg-[#802d00]" />
                  <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#802d00]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Below Welcome Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-24"
          >
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 sm:p-16 shadow-2xl border-2 border-[#504008]/20">
                <div className="space-y-8 text-[#322511] leading-relaxed text-lg">
                  <p className="text-xl">
                    At <strong style={{fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif", color: '#802d00'}}>COCO SPICE</strong>, food is more than something served on a plate—it is a way of bringing people together. Our menu is inspired by the rich culinary traditions of Kerala and the wider flavours of India. From comforting Kerala curries and freshly prepared dosas to aromatic biryanis, tandoori favourites, seafood specialities and classic British-Indian dishes, every meal is created to offer warmth, flavour and a genuine sense of home.
                  </p>
                  
                  <p>
                    We believe great Indian food begins with carefully selected ingredients, aromatic spices and time-honoured cooking techniques. Coconut, curry leaves, ginger, garlic, chillies and freshly ground spices come together to create dishes that are full of character, yet balanced enough for every taste. Whether you prefer something mild and creamy, rich and comforting, or bold and spicy, there is something waiting for you at <strong style={{fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif", color: '#802d00'}}>COCO SPICE</strong>.
                  </p>
                  
                  <p>
                    Our restaurant celebrates both authenticity and variety. Guests can enjoy traditional Kerala favourites such as kappa, Malabar curries, meen curry and South Indian dosas, alongside familiar favourites including butter chicken, chicken tikka masala, rogan gosht, biryani and tandoori dishes.
                  </p>
                  
                  <p>
                    But <strong style={{fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif", color: '#802d00'}}>COCO SPICE</strong> is not only about the food. It is about hospitality. We want every guest to feel welcome from the moment they arrive. Whether you are joining us for a family meal, meeting friends, celebrating a special occasion or simply discovering Kerala cuisine for the first time, our aim is to make your experience relaxed, enjoyable and memorable.
                  </p>
                  
                  <p>
                    At <strong style={{fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif", color: '#802d00'}}>COCO SPICE</strong>, every dish tells a story of spice, culture and tradition—and every table is an invitation to share it.
                  </p>
                  
                  {/* Final Tagline */}
                  <div className="mt-12 pt-8 border-t-2 border-[#802d00]/20">
                    <p className="text-center text-2xl font-black" style={{
                      fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif", 
                      color: '#802d00', 
                      letterSpacing: '0.05em'
                    }}>
                      COCO SPICE — Where Every Bite Becomes a Memorable Experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <div className="mb-24">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#802d00] to-[#504008] mb-4 shadow-lg">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-black text-[#322511] mb-2">{stat.number}</div>
                  <div className="text-sm font-semibold text-[#322511]/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do at Cocospice
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} mb-6 shadow-lg`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chef's Special Section */}
          <div className="mb-24">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 sm:p-12 lg:p-16 border-2 border-amber-100">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md mb-6">
                    <ChefHat className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-bold text-amber-900">From Our Kitchen</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
                    Crafted with Expertise & Love
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Our experienced chefs bring decades of culinary expertise, using traditional cooking methods 
                      and authentic spice blends to create dishes that honor Indian culinary heritage.
                    </p>
                    <p>
                      Every curry is simmered to perfection, every tandoori dish is cooked in our traditional clay oven, 
                      and every biryani is layered with aromatic basmati rice and tender meat or vegetables.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="text-4xl mb-3">🌶️</div>
                    <h4 className="font-bold text-gray-900 mb-2">Authentic Spices</h4>
                    <p className="text-sm text-gray-600">Imported directly from India</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="text-4xl mb-3">🔥</div>
                    <h4 className="font-bold text-gray-900 mb-2">Tandoor Oven</h4>
                    <p className="text-sm text-gray-600">Traditional clay oven cooking</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="text-4xl mb-3">🥘</div>
                    <h4 className="font-bold text-gray-900 mb-2">Fresh Daily</h4>
                    <p className="text-sm text-gray-600">Made fresh every day</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="text-4xl mb-3">✨</div>
                    <h4 className="font-bold text-gray-900 mb-2">Secret Recipes</h4>
                    <p className="text-sm text-gray-600">Family recipes perfected over time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 rounded-3xl p-12 sm:p-16 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
              <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
              
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  Experience the Cocospice Difference
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of satisfied customers who have made us their favorite Indian restaurant
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/menu"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                      <img 
                        src="/coco-logo.png" 
                        alt="Cocospice" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    View Our Menu
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Heart className="w-5 h-5" />
                    Visit Us Today
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
