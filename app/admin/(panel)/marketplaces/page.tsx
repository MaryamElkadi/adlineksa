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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
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
  );
}
