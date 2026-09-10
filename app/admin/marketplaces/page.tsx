import React from 'react';
import MarketplaceCard from '@/components/MarketplaceCard';

export default function MarketplacesPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <MarketplaceCard
        title="Amazon السعودية"
        description="تصدير منتجات إلى منصة Amazon السعودية"
        marketplace="amazon"
      />
      <MarketplaceCard
        title="Noon السعودية"
        description="تصدير منتجات إلى منصة Noon السعودية"
        marketplace="noon"
      />
    </div>
  );
}
