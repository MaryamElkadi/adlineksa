import { NextResponse } from "next/server";
import Quote from "@/models/Quote";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/quotes/[id]">
) {
  await connectToDatabase();

  const { id } = await params;

  const body = await request.json();

  const quote = await Quote.findByIdAndUpdate(
    id,
    body,
    {
      new: true,
    }
  );

  return NextResponse.json(
    serializeDocument(quote)
  );
}

export async function DELETE(
  request: Request,
  { params }: RouteContext<"/api/quotes/[id]">
) {
  await connectToDatabase();

  const { id } = await params;

  await Quote.findByIdAndDelete(id);

  return new NextResponse(null, {
    status: 204,
  });
}