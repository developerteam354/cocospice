'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader  from '@/components/admin/AdminHeader';
import AdminFooter  from '@/components/admin/AdminFooter';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, isInitialized } = useAppSelector(
    (s: RootState) => s.auth
  );

  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Auth guard — wait for initialization before redirecting
  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) router.replace('/admin/login');
  }, [isAuthenticated, isInitialized, router]);

  // Show spinner while auth is being verified
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#10b981]" />
          <p className="text-sm font-medium text-gray-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((c) => !c)}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        <AdminHeader onMobileMenuOpen={() => setMobileOpen(true)} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            {/* Content card */}
            <div className="min-h-[75vh] rounded-[32px] border border-white bg-white/90 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl lg:p-8">
              {children}
            </div>
          </div>
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
