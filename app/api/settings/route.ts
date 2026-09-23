import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings } from "@/lib/siteSettings";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne({ key: "default" }).lean();
    return NextResponse.json(normalizeSiteSettings(settings));
  } catch {
    return NextResponse.json(DEFAULT_SITE_SETTINGS);
  }
}

export async function PATCH(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const quickActions = Array.isArray(body.chatbotQuickActions)
      ? body.chatbotQuickActions.map((item: unknown) => String(item).trim()).filter(Boolean).slice(0, 8)
      : undefined;
    const update = {
      ...(typeof body.whatsappNumber === "string" ? { whatsappNumber: body.whatsappNumber.replace(/\D/g, "").slice(0, 20) } : {}),
      ...(typeof body.whatsappMessage === "string" ? { whatsappMessage: body.whatsappMessage.trim().slice(0, 240) } : {}),
      ...(typeof body.chatbotEnabled === "boolean" ? { chatbotEnabled: body.chatbotEnabled } : {}),
      ...(typeof body.chatbotWelcomeMessage === "string" ? { chatbotWelcomeMessage: body.chatbotWelcomeMessage.trim().slice(0, 500) } : {}),
      ...(typeof body.chatbotAvailabilityMessage === "string" ? { chatbotAvailabilityMessage: body.chatbotAvailabilityMessage.trim().slice(0, 500) } : {}),
      ...(quickActions ? { chatbotQuickActions: quickActions } : {}),
    };

    if (!update.whatsappNumber) {
      return NextResponse.json({ message: "رقم واتساب مطلوب." }, { status: 400 });
    }

    await connectToDatabase();
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "default" },
      { $set: update, $setOnInsert: { key: "default" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json(normalizeSiteSettings(settings));
  } catch {
    return NextResponse.json({ message: "تعذر حفظ الإعدادات." }, { status: 500 });
  }
}
