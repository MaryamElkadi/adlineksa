import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Service from "@/models/Service";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { try { await connectToDatabase(); const requestedLimit = Number(new URL(request.url).searchParams.get("limit")); const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 0; const query = Service.find({ active: true, featured: true }).sort({ sortOrder: 1, createdAt: -1 }); if (limit) query.limit(limit); const services = await query; return NextResponse.json(services.map(serializeDocument)); } catch { return NextResponse.json({ message: "Could not load featured services" }, { status: 500 }); } }
