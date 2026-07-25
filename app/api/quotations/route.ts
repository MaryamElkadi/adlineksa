import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quotation from "@/models/Quotation";

export async function GET() {
  await connectToDatabase();

  const quotations = await Quotation.find().sort({
    createdAt: -1,
  });

  return NextResponse.json(quotations);
}

export async function POST(request: Request) {
  await connectToDatabase();

  const body = await request.json();

  const quotation = await Quotation.create(body);

  return NextResponse.json(quotation);
}