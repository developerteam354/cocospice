'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShoppingBag, UtensilsCrossed, Smartphone, Clock, MapPin, Phone, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export default function ServicesPage() {
  const services = [
    {
      icon: Truck,
      title: 'Free Delivery',
      status: 'available',
      description: 'Enjoy complimentary delivery within a 7-mile radius of our restaurant. Fast, reliable, and always free.',
      features: [
        'Free within 7 miles radius',
        'Average delivery time: 30-45 minutes',
        'Real-time order tracking',
        'Contactless delivery available',
      ],
      color: 'from-[#802d00] to-[#802d00]/80',
      bgColor: 'from-[#802d00]/10 to-[#802d00]/5',
    },
    {
      icon: ShoppingBag,
      title: 'Self-Collection',
      status: 'available',
      description: 'Order online and pick up at your convenience. Skip the queue and collect your fresh, hot meal ready when you arrive.',
      features: [
        'Order online, collect in-store',
        'Ready in 20-30 minutes',
        'Skip the wait with pre-payment',
        'Perfect for busy schedules',
      ],
      color: 'from-[#504008] to-[#504008]/80',
      bgColor: 'from-[#504008]/10 to-[#504008]/5',
    },
    {
      icon: UtensilsCrossed,
      title: 'Dine-in Reservation',
      status: 'coming-soon',
      description: 'Reserve your table in advance for a premium dining experience. Full table service with our complete menu.',
      features: [
        'Table reservations system',
        'Premium dining experience',
        'Full menu available',
        'Special occasion bookings',
      ],
      color: 'from-[#322511] to-[#322511]/80',
      bgColor: 'from-[#322511]/10 to-[#322511]/5',
    },
    {
      icon: Smartphone,
      title: 'Third-Party Delivery',
      status: 'coming-soon',
      description: 'Soon available on Uber Eats, Deliveroo, and Just Eat. Order through your favorite delivery platform.',
      features: [
        'Uber Eats integration',
        'Deliveroo partnership',
        'Just Eat availability',
        'Extended delivery coverage',
      ],
      color: 'from-[#802d00] to-[#504008]',
      bgColor: 'from-[#802d00]/10 to-[#504008]/5',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header 
        cartCount={0} 
        onOpenCart={() => {}} 
        onOpenAuth={() => {}}
        shopStatus={null}
        activePage="menu"
      />

      {/* Hero Section */}
      <section className="relative bg-[#322511] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#802d00]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#504008]/20 rounded-full blur-3xl" />
        </div>
        
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
              Our <span className="text-[#802d00]" style={{fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif"}}>Services</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#f6eada] max-w-3xl mx-auto leading-relaxed">
              Multiple ways to enjoy authentic Indian cuisine. Choose the service that fits your lifestyle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1 bg-[#f6eada]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          
          {/* Company Overview */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-[#322511] mb-6">
                Committed to Quality Service
              </h2>
              <p className="text-lg text-[#322511]/80 leading-relaxed mb-8">
                At <span className="font-black text-[#802d00]" style={{fontFamily: "var(--font-league-spartan), 'League Spartan', sans-serif"}}>COCO SPICE</span>, we believe great food deserves great service. Whether you're dining in, collecting, or having 
                your meal delivered, we're committed to providing a seamless experience from order to plate. Our team works 
                tirelessly to ensure every dish reaches you fresh, hot, and bursting with authentic Indian flavors.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 text-[#322511]">
                  <CheckCircle2 className="w-5 h-5 text-[#802d00]" />
                  <span className="font-semibold">Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2 text-[#322511]">
                  <CheckCircle2 className="w-5 h-5 text-[#802d00]" />
                  <span className="font-semibold">Always Fresh</span>
                </div>
                <div className="flex items-center gap-2 text-[#322511]">
                  <CheckCircle2 className="w-5 h-5 text-[#802d00]" />
                  <span className="font-semibold">Fast & Reliable</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: service.status === 'available' ? 1.02 : 1 }}
                className={`relative bg-white rounded-3xl shadow-xl border-2 overflow-hidden ${
                  service.status === 'available' 
                    ? 'border-gray-100 hover:shadow-2xl' 
                    : 'border-gray-100 opacity-75'
                } transition-all`}
              >
                {/* Status Badge */}
                {service.status === 'coming-soon' && (
                  <div className="absolute top-6 right-6 z-10">
                    <div className="bg-[#322511] text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg border-2 border-white">
                      Coming Soon
                    </div>
                  </div>
                )}

                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-30`} />
                
                {/* Content */}
                <div className="relative p-8 sm:p-10">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} mb-6 shadow-lg`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-black text-[#322511] mb-3">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#322511]/70 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {service.status === 'available' ? (
                          <CheckCircle2 className="w-5 h-5 text-[#802d00] shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-5 h-5 text-[#504008] shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm font-medium ${
                          service.status === 'available' ? 'text-[#322511]' : 'text-[#322511]/60'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decorative Element */}
                <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${service.color} opacity-10 rounded-full blur-3xl`} />
              </motion.div>
            ))}
          </div>

          {/* Delivery Info Section */}
          <div className="mb-20">
            <div className="bg-gradient-to-br from-[#802d00] to-[#802d00]/80 rounded-3xl p-8 sm:p-12 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
              <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-black mb-8 text-center">
                  Delivery Coverage & Timing
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-black text-xl mb-2">Delivery Radius</h4>
                    <p className="text-white/90">We deliver within a <strong>7-mile radius</strong> of our restaurant location in Lincoln.</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-black text-xl mb-2">Delivery Time</h4>
                    <p className="text-white/90">Average delivery time is <strong>30-45 minutes</strong> depending on your location.</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-black text-xl mb-2">Free Delivery</h4>
                    <p className="text-white/90">No delivery charges! All orders within our radius are delivered <strong>completely free</strong>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-black text-[#322511] mb-8 text-center">
                Questions About Our Services?
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#322511]/10 text-center hover:shadow-xl transition-all">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-[#802d00]/10 rounded-xl mb-4">
                    <Phone className="w-7 h-7 text-[#802d00]" />
                  </div>
                  <h4 className="font-bold text-[#322511] mb-2">Call Us</h4>
                  <a href="tel:+441522534202" className="text-[#802d00] font-semibold hover:text-[#802d00]/80">
                    01522 534202
                  </a>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#322511]/10 text-center hover:shadow-xl transition-all">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-[#504008]/10 rounded-xl mb-4">
                    <MapPin className="w-7 h-7 text-[#504008]" />
                  </div>
                  <h4 className="font-bold text-[#322511] mb-2">Visit Us</h4>
                  <p className="text-[#322511]/70 text-sm">370 High Street<br />Lincoln LN5 7RU</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#322511]/10 text-center hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-[#802d00]/10 rounded-xl mb-4">
                    <Clock className="w-7 h-7 text-[#802d00]" />
                  </div>
                  <h4 className="font-bold text-[#322511] mb-2">Opening Hours</h4>
                  <p className="text-[#322511]/70 text-sm font-semibold">Wed - Mon: 12:00 PM - 11:00 PM</p>
                  <p className="text-[#322511]/50 text-xs mt-1">Closed on Tuesdays</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-[#322511] to-[#322511]/90 rounded-3xl p-12 sm:p-16 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
              <div className="absolute top-10 right-10 w-64 h-64 bg-[#802d00]/20 rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#504008]/20 rounded-full blur-3xl" />
              
              <div className="relative text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
                  Ready to Explore Our Menu?
                </h2>
                <p className="text-lg sm:text-xl text-[#f6eada] mb-8 max-w-2xl mx-auto">
                  Discover over 50 authentic Indian dishes prepared fresh daily with premium ingredients
                </p>
                <a
                  href="/menu"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-[#802d00] hover:bg-[#802d00]/80 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                    <img 
                      src="/coco__logo.png" 
                      alt="COCO SPICE" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  Explore Our Menu
                  <ArrowRight className="w-6 h-6" />
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
