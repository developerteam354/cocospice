'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export default function ContactPage() {
  const openInGoogleMaps = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=53.2215,-0.5422', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header 
        cartCount={0} 
        onOpenCart={() => {}} 
        onOpenAuth={() => {}}
        shopStatus={null}
        activePage="contact"
      />
      
      {/* Hero Section */}
      <section className="relative bg-[#322511] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#322511]/30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white mb-6 shadow-2xl overflow-hidden">
              <img 
                src="/coco__logo.png" 
                alt="COCO SPICE Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
              Get In <span className="text-[#802d00]" style={{fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif"}}>Touch</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#f6eada] max-w-2xl mx-auto leading-relaxed">
              We'd love to hear from you! Visit us, call us, or drop by for an unforgettable dining experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1 bg-[#f6eada]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left Column - Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black text-[#322511] mb-6">Contact Information</h2>
                <p className="text-[#322511]/80 text-lg leading-relaxed">
                  Whether you have a question about our menu, want to make a reservation, or just want to say hello, we're here for you.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {/* Address Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-[#322511]/10 hover:shadow-xl transition-all cursor-pointer"
                  onClick={openInGoogleMaps}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#802d00]/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-[#802d00]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#322511] mb-1 text-lg">Visit Us</h3>
                      <p className="text-[#322511]/70 leading-relaxed">
                        370 High Street<br />
                        Lincoln LN5 7RU<br />
                        United Kingdom
                      </p>
                      <button
                        onClick={openInGoogleMaps}
                        className="mt-3 inline-flex items-center gap-2 text-[#802d00] font-semibold text-sm hover:text-[#802d00]/80 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Phone Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-[#322511]/10 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#504008]/10 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-[#504008]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#322511] mb-1 text-lg">Call Us</h3>
                      <a 
                        href="tel:+441522534202" 
                        className="text-[#322511]/70 hover:text-[#802d00] transition-colors text-lg font-medium"
                      >
                        01522 534202
                      </a>
                      <p className="text-sm text-[#322511]/50 mt-1">
                        Available during business hours
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Email Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-[#322511]/10 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#802d00]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-[#802d00]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#322511] mb-1 text-lg">Email Us</h3>
                      <a 
                        href="mailto:info@cocospice.uk" 
                        className="text-[#322511]/70 hover:text-[#802d00] transition-colors font-medium"
                      >
                        info@cocospice.uk
                      </a>
                      <p className="text-sm text-[#322511]/50 mt-1">
                        We'll respond within 24 hours
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Business Hours Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-br from-[#802d00] to-[#802d00]/80 rounded-2xl p-8 shadow-xl text-white"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-black text-2xl">Business Hours</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="font-semibold">Wednesday - Monday</span>
                    <span className="font-bold">12:00 PM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold">Tuesday</span>
                    <span className="font-bold text-white/70">Closed (Weekly Holiday)</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-white/90 leading-relaxed">
                    <strong>Note:</strong> Last orders are taken 30 minutes before closing time. 
                    We recommend calling ahead for large groups or special occasions.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Map Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-black text-[#322511] mb-4">Find Us</h2>
                <p className="text-[#322511]/80 text-lg leading-relaxed">
                  Located in the heart of Lincoln, we're easy to find and even easier to love.
                </p>
              </div>

              {/* Interactive Map */}
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white cursor-pointer group h-[500px]"
                onClick={openInGoogleMaps}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2423.8!2d-0.5422!3d53.2215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTPCsDEzJzE3LjQiTiAwwrAzMiczMS45Ilc!5e0!3m2!1sen!2suk!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale-[30%] group-hover:grayscale-0 transition-all duration-300"
                />
                
                {/* Map Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white rounded-xl p-4 shadow-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#802d00] flex items-center justify-center">
                          <Navigation className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-[#322511]">Click to open in Google Maps</p>
                          <p className="text-sm text-[#322511]/70">Get turn-by-turn directions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-[#322511]/10 text-center">
                  <div className="text-3xl font-black text-[#802d00] mb-2">7 miles</div>
                  <div className="text-sm font-semibold text-[#322511]/70">Delivery Radius</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-[#322511]/10 text-center">
                  <div className="text-3xl font-black text-[#802d00] mb-2">30min</div>
                  <div className="text-sm font-semibold text-[#322511]/70">Avg. Delivery Time</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20"
          >
            <div className="bg-gradient-to-br from-[#322511] to-[#322511]/90 rounded-3xl p-12 sm:p-16 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
              <div className="relative text-center">
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  Ready to Experience Authentic Indian Cuisine?
                </h2>
                <p className="text-lg text-[#f6eada] mb-8 max-w-2xl mx-auto">
                  Order online now or visit us for an unforgettable dining experience
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/menu"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#802d00] hover:bg-[#802d00]/80 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                      <img 
                        src="/coco__logo.png" 
                        alt="COCO SPICE" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    Order Online
                  </a>
                  <a
                    href="tel:+441522534202"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-[#f6eada] text-[#322511] font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Phone className="w-5 h-5" />
                    Call to Order
                  </a>
                </div>
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
