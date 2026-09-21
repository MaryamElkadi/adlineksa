import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { serializeDocument } from "@/lib/serializers";
import Service from "@/models/Service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin") === "true";
    if (admin) { const auth = await requireAdmin(); if (auth.response) return auth.response; }
    const category = searchParams.get("category");
    const query = { ...(admin ? {} : { active: true }), ...(category ? { category } : {}) };
    const hasPagination = searchParams.has("page");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || (admin ? 20 : 6)));
    const cardFields = "title titleAr slug shortDescription shortDescriptionAr image icon category price priceLabel featured";
    const services = await Service.find(query)
      .select(admin ? '' : cardFields)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(hasPagination ? (page - 1) * limit : 0)
      .limit(hasPagination ? limit + 1 : 0);
    if (hasPagination) {
      const hasMore = services.length > limit;
      return NextResponse.json({ items: services.slice(0, limit).map(serializeDocument), page, limit, hasMore });
    }
    return NextResponse.json(services.map(serializeDocument));
  } catch { return NextResponse.json({ message: "Could not load services" }, { status: 500 }); }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(); if (auth.response) return auth.response;
  try {
    const body = await request.json();
    if (!body.titleAr || !body.descriptionAr || !body.slug || !body.category) return NextResponse.json({ message: "Arabic name, Arabic description, slug and category are required." }, { status: 400 });
    await connectToDatabase();
    const service = await Service.create(body);
    return NextResponse.json(serializeDocument(service), { status: 201 });
  } catch (error: unknown) {
    const duplicate = error instanceof Error && "code" in error && (error as { code?: number }).code === 11000;
    return NextResponse.json({ message: duplicate ? "This service slug is already in use." : "Could not create service" }, { status: duplicate ? 409 : 500 });
  }
}
