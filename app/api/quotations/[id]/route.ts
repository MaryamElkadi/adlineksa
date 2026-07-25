import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Quotation from "@/models/Quotation";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/quotations/[id]">
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return NextResponse.json(
        { message: "Quotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeDocument(quotation));
  } catch {
    return NextResponse.json(
      { message: "Could not load quotation." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/quotations/[id]">
) {
  try {
    const { id } = await params;

    const body = await request.json();

    await connectToDatabase();

    const quotation = await Quotation.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!quotation) {
      return NextResponse.json(
        { message: "Quotation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeDocument(quotation));
  } catch {
    return NextResponse.json(
      { message: "Could not update quotation." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext<"/api/quotations/[id]">
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const quotation = await Quotation.findByIdAndDelete(id);

    if (!quotation) {
      return NextResponse.json(
        { message: "Quotation not found." },
        { status: 404 }
      );
    }

    return new NextResponse(null, {
      status: 204,
    });
  } catch {
    return NextResponse.json(
      { message: "Could not delete quotation." },
      { status: 500 }
    );
  }
}