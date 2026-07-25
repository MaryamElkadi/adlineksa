import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { serializeDocument } from "@/lib/serializers";

export async function GET() {
  await connectToDatabase();

  const quotes = await Quote.find().sort({
    createdAt: -1,
  });

  return NextResponse.json(quotes.map(serializeDocument));
}

export async function POST(request: Request) {
  await connectToDatabase();

  const body = await request.json();

  const quote = await Quote.create(body);

  return NextResponse.json(
    serializeDocument(quote),
    {
      status: 201,
    }
  );
}