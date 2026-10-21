import { NextResponse } from "next/server";
import Quote from "@/models/Quote";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/quotes/[id]">
) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  await connectToDatabase();

  const { id } = await params;
  const body = await request.json();
  const allowed: Record<string, unknown> = {};
  if (typeof body.status === "string") allowed.status = body.status;
  if (body.quotationPrice !== undefined) allowed.quotationPrice = Number(body.quotationPrice) || 0;
  if (typeof body.adminNotes === "string") allowed.adminNotes = body.adminNotes;

  const quote = await Quote.findByIdAndUpdate(
    id,
    allowed,
    {
      returnDocument: "after",
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
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  await connectToDatabase();

  const { id } = await params;

  await Quote.findByIdAndDelete(id);

  return new NextResponse(null, {
    status: 204,
  });
}
