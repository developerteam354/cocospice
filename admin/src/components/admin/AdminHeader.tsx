'use client';

import { usePathname } from 'next/navigation';
import { Menu, Bell, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { toProxyUrl } from '@/services/productService';
import Image from 'next/image';

interface AdminHeaderProps {
  onMobileMenuOpen: () => void;
}

// Build breadcrumbs from pathname
function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    href:  '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));
}

export default function AdminHeader({ onMobileMenuOpen }: AdminHeaderProps) {
  const breadcrumbs = useBreadcrumbs();
  const admin       = useAppSelector((s: RootState) => s.auth.admin);

  return (
    <header className="flex h-[76px] shrink-0 items-center gap-4 border-b border-gray-100 bg-white/80 backdrop-blur-2xl px-5 lg:px-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10 sticky top-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuOpen}
        className="rounded-[14px] border border-gray-100 bg-white p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm active:scale-95 lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[0.95rem]">
        {breadcrumbs.map(({ label, href, isLast }) => (
          <span key={href} className="flex items-center gap-1.5">
            {!isLast ? (
              <>
                <span className="text-gray-400 font-semibold hover:text-gray-700 transition-colors cursor-pointer tracking-wide">
                  {label}
                </span>
                <ChevronRight size={14} className="text-gray-300" />
              </>
            ) : (
              <span className="font-extrabold text-gray-900 tracking-wide">{label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        {/* Notifications */}
        <button className="relative rounded-full border border-gray-100 bg-white p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
          <Bell size={20} />
          <span className="absolute right-[6px] top-[6px] h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 rounded-full border border-gray-100 bg-white p-1 pr-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] text-sm font-extrabold text-white border-[2.5px] border-white shadow-sm">
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
                    parent.innerHTML = `<span>${admin?.fullName?.[0]?.toUpperCase() ?? 'A'}</span>`;
                  }
                }}
              />
            ) : (
              <span>{admin?.fullName?.[0]?.toUpperCase() ?? 'A'}</span>
            )}
          </div>
          <span className="hidden text-[0.95rem] font-bold text-gray-800 sm:block">
            {admin?.fullName ?? 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
