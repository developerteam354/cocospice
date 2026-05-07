'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new orders page
    router.replace('/admin/orders/new');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#10b981] border-r-transparent"></div>
        <p className="mt-4 font-medium text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
