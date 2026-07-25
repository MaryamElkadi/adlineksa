import mongoose, { Schema, Document } from 'mongoose';

export interface IQuoteRequest extends Document {
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Date;
  status: 'pending' | 'answered';
  response?: string;
}

const QuoteRequestSchema = new Schema<IQuoteRequest>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
  response: { type: String },
});

export const QuoteRequest = mongoose.models.QuoteRequest || mongoose.model<IQuoteRequest>('QuoteRequest', QuoteRequestSchema);
