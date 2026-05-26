'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Award, Users, Leaf, Clock, Star, ChefHat, Sparkles } from 'lucide-react';
import Header from '@/components/Header/Header';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Passion for Food',
      description: 'Every dish is crafted with love and dedication to authentic Indian flavors',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Award,
      title: 'Quality Ingredients',
      description: 'We source the finest spices and freshest ingredients for exceptional taste',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building lasting relationships with our customers and local community',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Leaf,
      title: 'Sustainable Practices',
      description: 'Committed to eco-friendly operations and supporting local suppliers',
      color: 'from-green-500 to-emerald-500',
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
        shopStatus={null}
        activePage="about"
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 mb-6 shadow-2xl p-2 overflow-hidden">
              <img 
                src="/coco-logo.png" 
                alt="Cocospice Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
              Our <span className="text-emerald-400">Story</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A journey of flavors, tradition, and passion for authentic Indian cuisine in the heart of Lincoln
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          
          {/* Story Section */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-20" />
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 sm:p-12 shadow-2xl">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-2 border-2 border-emerald-400/30 overflow-hidden">
                    <img 
                      src="/coco-logo.png" 
                      alt="Cocospice Logo" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 text-center">
                    Welcome to Cocospice
                  </h2>
                  <p className="text-lg text-white/90 leading-relaxed text-center">
                    Where tradition meets innovation in every bite
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                Bringing Authentic Indian Flavors to Lincoln
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Established with a passion for authentic Indian cuisine, Cocospice has been serving the Lincoln community 
                  with traditional recipes passed down through generations, combined with modern culinary techniques.
                </p>
                <p>
                  Our journey began with a simple vision: to create a dining experience that transports you to the vibrant 
                  streets of India, where every dish tells a story and every spice has a purpose.
                </p>
                <p>
                  From our carefully curated menu to our warm hospitality, we strive to make every visit memorable. 
                  Whether you're dining in or ordering for delivery, we bring the same level of care and authenticity to every plate.
                </p>
              </div>
            </motion.div>
          </div>

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
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-black text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
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
                    href="/"
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
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-2 overflow-hidden border-2 border-emerald-400/30">
              <img 
                src="/coco-logo.png" 
                alt="Cocospice Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black mb-2">
                Coco<span className="text-emerald-400">spice</span>
              </h3>
              <p className="text-gray-400 text-sm">Premium Indian Cuisine</p>
            </div>
            <div className="text-center text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} Cocospice. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
