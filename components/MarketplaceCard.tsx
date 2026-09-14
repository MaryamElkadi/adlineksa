"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card'; // assuming existing Card component

interface MarketplaceCardProps {
  title: string;
  description: string;
  marketplace: 'amazon' | 'noon';
  connection?: {
    connected: boolean;
    status: string;
    accountName: string | null;
  };
}

export default function MarketplaceCard({ title, description, marketplace, connection }: MarketplaceCardProps) {
  const isConnected = connection?.connected ?? false;
  const accountName = connection?.accountName;
  const statusColor = isConnected ? 'bg-emerald-500' : 'bg-gray-400';

  const router = useRouter();

  const handleConnectOrSettings = async () => {
    if (isConnected) {
      // Navigate to settings page
      router.push(`/admin/marketplaces/${marketplace}/settings`);
    } else {
      const method = 'POST';
      await fetch(`/api/admin/marketplaces/${marketplace}/connect`, { method });
      // reload to update status
      window.location.reload();
    }
  };

  return (
    <Card className="flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-slate-600 mb-4">{description}</p>
      <div className="flex items-center space-x-2 mb-3">
        <span className={`inline-block w-2 h-2 rounded-full ${statusColor}`}></span>
        <span className="text-xs">{isConnected ? 'Connected' : 'Not Connected'}{accountName ? ` – ${accountName}` : ''}</span>
      </div>
      <div className="flex space-x-2">
        <Link href={`/admin/products?marketplace=${marketplace}`} className="px-4 py-2 bg-amber-400 text-slate-900 rounded-lg font-bold hover:bg-amber-500 transition">
          Select Products
        </Link>
        <Link href={`/api/admin/marketplaces/${marketplace}/export`} className="px-4 py-2 bg-amber-200 text-slate-800 rounded-lg font-medium hover:bg-amber-300 transition">
          Export All Products
        </Link>
{isConnected ? (
  <Link href={`/admin/marketplaces/${marketplace}/settings`} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition">
    Settings
  </Link>
) : (
  <button
    onClick={handleConnectOrSettings}
    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition"
  >
    Connect
  </button>
)}
      </div>
    </Card>
  );
}
