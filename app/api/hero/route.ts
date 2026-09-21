import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { serializeDocument } from "@/lib/serializers";
import HeroConfig from "@/models/HeroConfig";
import Product from "@/models/Product";
import Service from "@/models/Service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const admin = new URL(request.url).searchParams.get("admin") === "true";
    if (admin) { const auth = await requireAdmin(); if (auth.response) return auth.response; }
    const config = await HeroConfig.findOne().lean();
    const configuredItems = (config?.items || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    const items = await Promise.all(configuredItems.map(async (entry: any) => {
      const Model = entry.itemType === "service" ? Service : Product;
      const document = await Model.findById(entry.itemId);
      if (!document || (!admin && document.active === false)) return null;
      return { ...serializeDocument(document), itemType: entry.itemType, hero: { badge: entry.badge, customTitle: entry.customTitle, customTitleAr: entry.customTitleAr, sortOrder: entry.sortOrder } };
    }));
    // A service marked from its own admin form belongs in the same rotating
    // Hero collection as manually selected products. Manually configured Hero
    // services keep their custom content and are never added twice.
    const configuredServiceIds = new Set(configuredItems.filter((item: any) => item.itemType === "service").map((item: any) => item.itemId.toString()));
    const automaticServices = await Service.find({ showInHero: true, ...(admin ? {} : { active: true }) }).sort({ sortOrder: 1, createdAt: -1 });
    const offset = configuredItems.length;
    const automaticItems = automaticServices
      .filter((service) => !configuredServiceIds.has(service._id.toString()))
      .map((service, index) => ({
        ...serializeDocument(service),
        itemType: "service",
        hero: { badge: "خدمة مميزة", customTitle: "", customTitleAr: "", sortOrder: offset + index },
      }));
    return NextResponse.json([...items.filter(Boolean), ...automaticItems]);
  } catch { return NextResponse.json({ message: "Could not load hero content" }, { status: 500 }); }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(); if (auth.response) return auth.response;
  try {
    const body = await request.json();
    if (!Array.isArray(body.items)) return NextResponse.json({ message: "Hero items are required" }, { status: 400 });
    await connectToDatabase();
    const items = body.items.map((item: any, index: number) => ({ itemType: item.itemType, itemId: item.itemId, sortOrder: Number(item.sortOrder ?? index), badge: item.badge || "", customTitle: item.customTitle || "", customTitleAr: item.customTitleAr || "" }));
    const config = await HeroConfig.findOneAndUpdate({}, { items }, { upsert: true, new: true, runValidators: true });
    return NextResponse.json(serializeDocument(config));
  } catch { return NextResponse.json({ message: "Could not save hero content" }, { status: 500 }); }
}
