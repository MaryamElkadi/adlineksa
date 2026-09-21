import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { serializeDocument } from "@/lib/serializers";
import Service from "@/models/Service";

export async function GET(request: Request, context: RouteContext<"/api/services/[id]">) {
  await connectToDatabase(); const { id } = await context.params; const admin = new URL(request.url).searchParams.get("admin") === "true";
  if (admin) { const auth = await requireAdmin(); if (auth.response) return auth.response; }
  const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
  const service = await Service.findOne(admin ? filter : { ...filter, active: true });
  return service ? NextResponse.json(serializeDocument(service)) : NextResponse.json({ message: "Service not found" }, { status: 404 });
}
export async function PUT(request: Request, context: RouteContext<"/api/services/[id]">) {
  const auth = await requireAdmin(); if (auth.response) return auth.response;
  try { const { id } = await context.params; await connectToDatabase(); const service = await Service.findByIdAndUpdate(id, await request.json(), { new: true, runValidators: true }); return service ? NextResponse.json(serializeDocument(service)) : NextResponse.json({ message: "Service not found" }, { status: 404 }); }
  catch (error: unknown) { const duplicate = error instanceof Error && "code" in error && (error as { code?: number }).code === 11000; return NextResponse.json({ message: duplicate ? "This service slug is already in use." : "Could not update service" }, { status: duplicate ? 409 : 500 }); }
}
export const PATCH = PUT;
export async function DELETE(_request: Request, context: RouteContext<"/api/services/[id]">) {
  const auth = await requireAdmin(); if (auth.response) return auth.response;
  await connectToDatabase(); const { id } = await context.params; const service = await Service.findByIdAndDelete(id);
  return service ? new NextResponse(null, { status: 204 }) : NextResponse.json({ message: "Service not found" }, { status: 404 });
}
