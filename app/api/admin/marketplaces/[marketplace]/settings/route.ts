// app/api/admin/marketplaces/[marketplace]/settings/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import MarketplaceConnection from '@/models/MarketplaceConnection';

type SafeSettings = {
  marketplace: string;
  connected: boolean;
  status: string;
  accountName: string | null;
  sellerId: string | null;
  clientId: string | null;
  hasCredentials: boolean;
};

function validateMarketplace(marketplace: string | null): string {
  if (!marketplace) throw new Error('Marketplace parameter is required');
  if (marketplace !== 'amazon' && marketplace !== 'noon') {
    throw new Error("Invalid marketplace. Must be 'amazon' or 'noon'");
  }
  return marketplace;
}

function safeSettings(rec: any): SafeSettings {
  const hasCredentials = !!(rec.sellerId && rec.refreshToken);
  return {
    marketplace: rec.marketplace,
    connected: hasCredentials,
    status: hasCredentials ? 'connected' : 'disconnected',
    accountName: rec.accountName ?? null,
    sellerId: rec.sellerId ?? null,
    clientId: rec.clientId ?? null,
    hasCredentials,
  };
}

export async function GET(request: Request, context: RouteContext<'/api/admin/marketplaces/[marketplace]/settings'>) {
  try {
    const { marketplace } = await context.params;
    const mp = validateMarketplace(marketplace);
    await connectToDatabase();
    const rec = await MarketplaceConnection.findOne({ marketplace: mp }).lean();
    if (!rec) {
      return NextResponse.json({
        marketplace: mp,
        connected: false,
        status: 'disconnected',
        accountName: null,
        sellerId: null,
        clientId: null,
        hasCredentials: false,
      });
    }
    return NextResponse.json(safeSettings(rec));
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Failed to fetch settings' }, { status: 400 });
  }
}

export async function PATCH(request: Request, context: RouteContext<'/api/admin/marketplaces/[marketplace]/settings'>) {
  try {
    const { marketplace } = await context.params;
    const mp = validateMarketplace(marketplace);
    const payload = await request.json();
    await connectToDatabase();
    const existing = await MarketplaceConnection.findOne({ marketplace: mp });
    const update: any = {};
    if (payload.accountName !== undefined) update.accountName = payload.accountName;
    if (payload.sellerId !== undefined) update.sellerId = payload.sellerId;
    if (payload.clientId !== undefined) update.clientId = payload.clientId;
    if (payload.clientSecret !== undefined) {
      if (payload.clientSecret) update.clientSecret = payload.clientSecret;
      else if (existing?.clientSecret) update.clientSecret = existing.clientSecret;
    }
    if (payload.refreshToken !== undefined) {
      if (payload.refreshToken) update.refreshToken = payload.refreshToken;
      else if (existing?.refreshToken) update.refreshToken = existing.refreshToken;
    }
    const rec = await MarketplaceConnection.findOneAndUpdate({ marketplace: mp }, { $set: update }, { new: true, upsert: true });
    return NextResponse.json(safeSettings(rec));
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Failed to save settings' }, { status: 400 });
  }
}
