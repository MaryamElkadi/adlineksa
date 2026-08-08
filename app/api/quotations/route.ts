import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import Quotation from "@/models/Quotation";
import { getCurrentUserId } from "@/lib/currentUser";

function serializeQuotation(quotation: any) {
  const value = quotation.toObject();

  return {
    ...value,
    _id: value._id.toString(),
    id: value._id.toString(),
  };
}

// GET MY QUOTATIONS
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const quotations = await Quotation.find({
      userId,
    })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      quotations.map(serializeQuotation)
    );
  } catch (error) {
    console.error(
      "GET MY QUOTATIONS ERROR:",
      error
    );

    return NextResponse.json(
      { message: "Could not load quotations" },
      { status: 500 }
    );
  }
}

// CREATE QUOTATION FOR CURRENT USER
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    await connectToDatabase();

    const quotation = await Quotation.create({
      ...body,

      // IMPORTANT
      userId,
    });

    return NextResponse.json(
      serializeQuotation(quotation),
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE QUOTATION ERROR:",
      error
    );

    return NextResponse.json(
      { message: "Could not create quotation" },
      { status: 500 }
    );
  }
}