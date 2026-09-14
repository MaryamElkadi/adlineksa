import { Schema, model, models } from 'mongoose';

const MarketplaceConnectionSchema = new Schema({
  marketplace: { type: String, enum: ['amazon', 'noon'], required: true, unique: true },
  connected: { type: Boolean, default: false },
  status: { type: String, enum: ['connected', 'disconnected', 'error'], default: 'disconnected' },
  sellerId: { type: String, default: null },
  accountName: { type: String, default: null },
  accessToken: { type: String, default: null },
  refreshToken: { type: String, default: null },
  tokenExpiresAt: { type: Date, default: null },
  lastSyncAt: { type: Date, default: null },
  errorMessage: { type: String, default: null },
}, { timestamps: true });

export default models.MarketplaceConnection || model('MarketplaceConnection', MarketplaceConnectionSchema);
