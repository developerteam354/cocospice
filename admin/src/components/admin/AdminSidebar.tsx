'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, Users, ShoppingCart,
  UserCircle, LogOut, ChevronLeft, ChevronRight, X, MessageSquare,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { logoutAdmin } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toProxyUrl } from '@/services/productService';

const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/admin/dashboard',  activeBase: '/admin/dashboard',  icon: LayoutDashboard },
  { label: 'Products',   href: '/admin/products',   activeBase: '/admin/products',   icon: Package },
  { label: 'Categories', href: '/admin/category',   activeBase: '/admin/category',   icon: Tag },
  { label: 'Orders',     href: '/admin/orders/new', activeBase: '/admin/orders',     icon: ShoppingCart },
  { label: 'Feedbacks',  href: '/admin/feedbacks',  activeBase: '/admin/feedbacks',  icon: MessageSquare },
  { label: 'Users',      href: '/admin/users',      activeBase: '/admin/users',      icon: Users },
  { label: 'Profile',    href: '/admin/profile',    activeBase: '/admin/profile',    icon: UserCircle },
];

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export default function AdminSidebar({
  collapsed, mobileOpen, onToggle, onMobileClose,
}: AdminSidebarProps) {
  const pathname  = usePathname();
  const dispatch  = useAppDispatch();
  const router    = useRouter();
  const admin     = useAppSelector((s: RootState) => s.auth.admin);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await dispatch(logoutAdmin());
    router.replace('/admin/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Admin Profile Header - Clickable to toggle */}
      <div 
        className="relative flex items-center gap-3 border-b border-gray-100 px-5 py-5 transition-colors"
      >
        {/* Profile Image - Always visible, clickable */}
        <div 
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-[#10b981] to-[#059669] cursor-pointer hover:scale-105 transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] border-2 border-white ${collapsed ? 'mx-auto' : ''}`}
          onClick={onToggle}
          title={collapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
        >
          {admin?.profileImage ? (
            <img
              src={toProxyUrl(admin.profileImage)}
              alt={admin.fullName}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-sm font-bold text-white">${admin?.fullName?.[0]?.toUpperCase() ?? 'A'}</span>`;
                }
              }}
            />
          ) : (
            <span className="text-sm font-bold text-white">
              {admin?.fullName?.[0]?.toUpperCase() ?? 'A'}
            </span>
          )}
        </div>
        
        {/* Name and Role - Hidden when collapsed */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden ml-1"
            >
              <p className="whitespace-nowrap text-[0.95rem] font-bold text-gray-900 truncate">
                {admin?.fullName ?? 'Admin'}
              </p>
              <p className="whitespace-nowrap text-[0.75rem] font-bold text-gray-500 capitalize">
                {admin?.role ?? 'Administrator'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile close button - Always visible on mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMobileClose();
          }}
          className="lg:hidden shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
        {NAV_ITEMS.map(({ label, href, activeBase, icon: Icon }) => {
          const active = pathname === activeBase || pathname.startsWith(activeBase + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={[
                'flex items-center gap-3.5 rounded-2xl px-4 py-3 text-[0.95rem] font-bold transition-all',
                active
                  ? 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-[0_6px_20px_rgba(16,185,129,0.25)]'
                  : 'text-gray-500 hover:bg-emerald-50 hover:text-[#10b981]',
              ].join(' ')}
            >
              <Icon size={20} className={active ? 'text-white' : 'text-gray-400'} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && !collapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-2 w-2 rounded-full bg-white shadow-sm"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button - Bottom */}
      <div className="border-t border-gray-100 p-4">
        <button
          onClick={handleLogoutClick}
          className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-[0.95rem] font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={20} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar with toggle arrow */}
      <div className="hidden lg:block relative shrink-0">
        <motion.aside
          animate={{ width: collapsed ? 88 : 280 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex flex-col h-full border-r border-gray-100 bg-white/95 backdrop-blur-2xl z-20 relative shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
        >
          {sidebarContent}
        </motion.aside>
        
        {/* Dedicated Toggle Arrow - Positioned outside sidebar */}
        <button
          onClick={onToggle}
          className="absolute top-[88px] -right-[14px] z-[100] w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-md"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col border-r border-gray-100 bg-white lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleLogoutCancel}
              className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-md rounded-[32px] border border-white bg-white/95 backdrop-blur-xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.15)]"
              >
                <div className="text-center">
                  {/* Icon */}
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-red-50 text-red-500 border border-red-100 shadow-sm">
                    <LogOut size={32} strokeWidth={2.5} />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-[1.4rem] font-bold text-gray-900">
                    Sign Out?
                  </h3>

                  {/* Description */}
                  <p className="mb-8 text-[0.95rem] text-gray-500 font-medium">
                    Are you sure you want to sign out of your account?
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleLogoutCancel}
                      className="flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-3.5 font-bold text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-900 shadow-sm active:scale-95"
                    >
                      No, Stay
                    </button>
                    <button
                      onClick={handleLogoutConfirm}
                      className="flex-1 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(239,68,68,0.4)] active:scale-95"
                    >
                      Yes, Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
