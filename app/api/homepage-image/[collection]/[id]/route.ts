import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import Exhibition from '@/models/Exhibition';
import Product from '@/models/Product';
import Service from '@/models/Service';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: RouteContext<'/api/homepage-image/[collection]/[id]'>,
) {
  const { collection, id } = await context.params;
  if (!['products', 'categories', 'services', 'exhibitions'].includes(collection) || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: 'Image not found' }, { status: 404 });
  }

  try {
    await connectToDatabase();
    const document = collection === 'products'
      ? await Product.findById(id).select('image').lean()
      : collection === 'categories'
        ? await Category.findById(id).select('image').lean()
        : collection === 'services'
          ? await Service.findById(id).select('image').lean()
          : await Exhibition.findById(id).select('image').lean();

    const image = document?.image;
    const match = typeof image === 'string'
      ? /^data:(image\/(?:jpe?g|png|webp|avif|gif));base64,([a-z\d+/=\s]+)$/i.exec(image)
      : null;
    if (!match) return NextResponse.json({ message: 'Image not found' }, { status: 404 });

    const contentType = match[1].toLowerCase().replace('image/jpg', 'image/jpeg');
    return new Response(Buffer.from(match[2], 'base64'), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Could not load homepage image', error);
    return NextResponse.json({ message: 'Could not load image' }, { status: 500 });
  }
}