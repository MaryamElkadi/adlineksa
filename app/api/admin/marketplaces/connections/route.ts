import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import MarketplaceConnection from '@/models/MarketplaceConnection';

function safeConnection(rec: any) {
  return {
    marketplace: rec.marketplace,
    connected: rec.connected,
    status: rec.status,
    accountName: rec.accountName ?? null,
  };
}

export async function GET() {
  try {
    await connectToDatabase();
    const records = await MarketplaceConnection.find({}).lean();
    const marketplaces = ['amazon', 'noon'];
    const result = marketplaces.map((mp) => {
      const rec = records.find((r) => r.marketplace === mp);
      if (rec) return safeConnection(rec);
      return {
        marketplace: mp,
        connected: false,
        status: 'disconnected',
        accountName: null,
      };
    });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Failed to fetch connections' }, { status: 400 });
  }
}
