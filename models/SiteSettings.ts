import { Schema, model, models } from "mongoose";

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: "default" },
    whatsappNumber: { type: String, default: "966503502717", trim: true },
    whatsappMessage: {
      type: String,
      default: "مرحباً، أريد الاستفسار عن خدمات خط الإعلان.",
      trim: true,
    },
    chatbotEnabled: { type: Boolean, default: true },
    chatbotWelcomeMessage: {
      type: String,
      default: "مرحباً بك في خط الإعلان. كيف يمكنني مساعدتك اليوم؟",
      trim: true,
    },
    chatbotAvailabilityMessage: {
      type: String,
      default: "يمكنني مساعدتك في الخدمات والمنتجات وطلبات التسعير والدعم.",
      trim: true,
    },
    chatbotQuickActions: {
      type: [String],
      default: ["طلب تسعير", "الطلبات والتتبع", "مراجعة التصميم", "الدعم الفني", "التواصل معنا"],
    },
  },
  { timestamps: true }
);

export default models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
