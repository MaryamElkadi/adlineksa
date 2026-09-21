import { NextResponse } from "next/server"; import { connectToDatabase } from "@/lib/mongodb"; import { serializeDocument } from "@/lib/serializers"; import Exhibition from "@/models/Exhibition";
export const dynamic = "force-dynamic";
export async function GET() { try { await connectToDatabase(); const exhibits = await Exhibition.find({ active: true, featured: true }).sort({ sortOrder: 1, createdAt: -1 }); return NextResponse.json(exhibits.map(serializeDocument)); } catch { return NextResponse.json({ message: "تعذر تحميل المعارض" }, { status: 500 }); } }
