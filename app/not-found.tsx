import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <span className="text-6xl font-black text-amber-400 mb-2">404</span>
      <h1 className="text-2xl font-black text-slate-800 mb-2">Page Not Found</h1>
      <p className="text-xs text-slate-400 mb-6">
        The printing product or category you are looking for might have been moved or updated.
      </p>
      <Link href="/">
        <Button variant="primary">Return to Homepage</Button>
      </Link>
    </div>
  );
}
