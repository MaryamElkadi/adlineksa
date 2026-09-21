'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TicketsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect cleanly to dashboard tickets tab
    router.replace('/dashboard?tab=tickets');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-700">جاري توجيهك إلى تذاكر الدعم الفني...</p>
      </div>
    </div>
  );
}
