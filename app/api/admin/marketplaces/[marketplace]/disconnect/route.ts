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

export async function DELETE(request: Request, context: RouteContext<'/api/admin/marketplaces/[marketplace]/disconnect'>) {
  try {
    const { marketplace } = await context.params;
    const mp = validateMarketplace(marketplace);

    await connectToDatabase();
    const update = {
      connected: false,
      status: 'disconnected',
      accountName: null,
    };
    const rec = await MarketplaceConnection.findOneAndUpdate({ marketplace: mp }, update, { new: true });
    if (!rec) {
      // If no record existed, create a baseline record as disconnected
      const newRec = await MarketplaceConnection.create({ marketplace: mp, ...update });
      return NextResponse.json(safeConnection(newRec));
    }
    return NextResponse.json(safeConnection(rec));
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Disconnect failed' }, { status: 400 });
  }
}
