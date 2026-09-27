import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { serializeDocument } from "@/lib/serializers";
import HeroConfig from "@/models/HeroConfig";
import Product from "@/models/Product";
import Service from "@/models/Service";
import { homepageImageUrl } from "@/lib/homepageImage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const admin = new URL(request.url).searchParams.get("admin") === "true";
    if (admin) { const auth = await requireAdmin(); if (auth.response) return auth.response; }
    await connectToDatabase();
    const config = await HeroConfig.findOne().select("items").lean();
    const configuredItems = (config?.items || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    const productIds = configuredItems.filter((item: any) => item.itemType !== "service").map((item: any) => item.itemId);
    const serviceIds = configuredItems.filter((item: any) => item.itemType === "service").map((item: any) => item.itemId);
    const heroFields = "name nameAr title titleAr slug image active updatedAt";
    const [products, configuredServices] = await Promise.all([
      productIds.length ? Product.find({ _id: { $in: productIds } }).select(heroFields).lean() : [],
      serviceIds.length ? Service.find({ _id: { $in: serviceIds } }).select(heroFields).lean() : [],
    ]);
    const documents = new Map([...products, ...configuredServices].map((document: any) => [String(document._id), document]));
    const items = configuredItems.map((entry: any) => {
      const document = documents.get(String(entry.itemId));
      if (!document || (!admin && document.active === false)) return null;
      const itemType = entry.itemType === "service" ? "service" : "product";
      const collection = itemType === "service" ? "services" : "products";
      return {
        id: String(document._id),
        slug: document.slug,
        image: homepageImageUrl(collection, String(document._id), document.image, document.updatedAt),
        name: document.name || document.title || "Product",
        nameAr: document.nameAr || document.titleAr || document.title || document.name,
        title: document.title || document.name || "Product",
        titleAr: document.titleAr || document.nameAr || document.title || document.name,
        itemType,
        hero: { badge: entry.badge, customTitle: entry.customTitle, customTitleAr: entry.customTitleAr, sortOrder: entry.sortOrder },
      };
    });
    // A service marked from its own admin form belongs in the same rotating
    // Hero collection as manually selected products. Manually configured Hero
    // services keep their custom content and are never added twice.
    const configuredServiceIds = new Set(configuredItems.filter((item: any) => item.itemType === "service").map((item: any) => item.itemId.toString()));
    const automaticServices = await Service.find({ showInHero: true, ...(admin ? {} : { active: true }) })
      .select(heroFields)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    const offset = configuredItems.length;
    const automaticItems = automaticServices
      .filter((service) => !configuredServiceIds.has(service._id.toString()))
      .map((service, index) => ({
        id: String(service._id),
        slug: service.slug,
        image: homepageImageUrl("services", String(service._id), service.image, service.updatedAt),
        name: service.name || service.title || "Product",
        nameAr: service.nameAr || service.titleAr || service.title || service.name,
        title: service.title || service.name || "Product",
        titleAr: service.titleAr || service.nameAr || service.title || service.name,
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
