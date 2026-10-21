"use client";
import React, { useEffect, useState } from 'react';
import MarketplaceCard from '@/components/MarketplaceCard';

interface ConnectionInfo {
  marketplace: 'amazon' | 'noon';
  connected: boolean;
  status: string;
  accountName: string | null;
}

export default function MarketplacesPage() {
  const [connections, setConnections] = useState<Record<string, ConnectionInfo>>({});

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch('/api/admin/marketplaces/connections');
        const data: ConnectionInfo[] = await res.json();
        const map: Record<string, ConnectionInfo> = {};
        data.forEach((c) => {
          map[c.marketplace] = c;
        });
        setConnections(map);
      } catch (err) {
        console.error('Failed to load marketplace connections', err);
      }
    };
    fetchConnections();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Import products to Salla</h2>
          <p className="mt-1 text-sm text-slate-600">
            Download the active product catalog as an Excel file, then upload it
            in Salla’s product import page.
          </p>
        </div>
        <a
          href="/api/admin/marketplaces/salla/export"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700"
        >
          Download Excel file
        </a>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <MarketplaceCard
          title="Amazon السعودية"
          description="تصدير منتجات إلى منصة Amazon السعودية"
          marketplace="amazon"
          connection={connections['amazon']}
        />
        <MarketplaceCard
          title="Noon السعودية"
          description="تصدير منتجات إلى منصة Noon السعودية"
          marketplace="noon"
          connection={connections['noon']}
        />
      </div>
    </div>
  );
}
