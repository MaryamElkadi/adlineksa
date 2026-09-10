import Link from 'next/link';
import { Card } from '@/components/ui/Card'; // assuming existing Card component

interface MarketplaceCardProps {
  title: string;
  description: string;
  marketplace: 'amazon' | 'noon';
}

export default function MarketplaceCard({ title, description, marketplace }: MarketplaceCardProps) {
  const basePath = `/admin/marketplaces/${marketplace}`;
  return (
    <Card className="flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-slate-600 mb-4">{description}</p>
      <div className="flex space-x-2">
        <Link href={basePath} className="px-4 py-2 bg-amber-400 text-slate-900 rounded-lg font-bold hover:bg-amber-500 transition">
          Select Products
        </Link>
        <Link href={`${basePath}/export`} className="px-4 py-2 bg-amber-200 text-slate-800 rounded-lg font-medium hover:bg-amber-300 transition">
          Export All Products
        </Link>
      </div>
    </Card>
  );
}
