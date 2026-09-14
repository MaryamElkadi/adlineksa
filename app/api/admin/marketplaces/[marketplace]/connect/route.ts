import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import MarketplaceConnection from '@/models/MarketplaceConnection';

function validateMarketplace(marketplace: string | null): string {
  if (!marketplace) throw new Error('Marketplace parameter is required');
  if (marketplace !== 'amazon' && marketplace !== 'noon') {
    throw new Error("Invalid marketplace. Must be 'amazon' or 'noon'");
  }
  return marketplace;
}

function safeConnection(rec: any) {
  return {
    marketplace: rec.marketplace,
    connected: rec.connected,
    status: rec.status,
    accountName: rec.accountName ?? null,
  };
}

export async function POST(request: Request, context: RouteContext<'/api/admin/marketplaces/[marketplace]/connect'>) {
  try {
    const { marketplace } = await context.params;
    const mp = validateMarketplace(marketplace);

    await connectToDatabase();
    const update = {
      connected: true,
      status: 'connected',
      accountName: `Development ${mp.charAt(0).toUpperCase() + mp.slice(1)} Account`,
    };
    const rec = await MarketplaceConnection.findOneAndUpdate({ marketplace: mp }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    return NextResponse.json(safeConnection(rec));
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Connect failed' }, { status: 400 });
  }
}
