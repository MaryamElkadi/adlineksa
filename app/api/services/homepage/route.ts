import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Service from "@/models/Service";
export const dynamic = "force-dynamic";
export async function GET() { try { await connectToDatabase(); const services = await Service.find({ active: true, showOnHomepage: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(6); return NextResponse.json(services.map(serializeDocument)); } catch { return NextResponse.json({ message: "Could not load homepage services" }, { status: 500 }); } }
