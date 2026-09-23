export const DEFAULT_SITE_SETTINGS = {
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966503502717").replace(/\D/g, ""),
  whatsappMessage: "مرحباً، أريد الاستفسار عن خدمات خط الإعلان.",
  chatbotEnabled: true,
  chatbotWelcomeMessage: "مرحباً بك في خط الإعلان. كيف يمكنني مساعدتك اليوم؟",
  chatbotAvailabilityMessage: "يمكنني مساعدتك في الخدمات والمنتجات وطلبات التسعير والدعم.",
  chatbotQuickActions: ["طلب تسعير", "الطلبات والتتبع", "مراجعة التصميم", "الدعم الفني", "التواصل معنا"],
};

export type PublicSiteSettings = typeof DEFAULT_SITE_SETTINGS;

export function normalizeSiteSettings(settings?: Partial<PublicSiteSettings> | null): PublicSiteSettings {
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...settings,
    whatsappNumber: String(settings?.whatsappNumber || DEFAULT_SITE_SETTINGS.whatsappNumber).replace(/\D/g, ""),
    chatbotQuickActions: Array.isArray(settings?.chatbotQuickActions) && settings.chatbotQuickActions.length > 0
      ? settings.chatbotQuickActions.filter(Boolean).slice(0, 8)
      : DEFAULT_SITE_SETTINGS.chatbotQuickActions,
  };
}
