import type { Metadata } from "next";
import ExhibitionCatalog from "./exhibition-catalog";
export const metadata: Metadata = {
  title: "تنظيم معارض وفعاليات | خط الإعلان",
  description:
    "خدمات تنظيم وتجهيز المعارض والفعاليات وتصميم الأجنحة والمساحات باحترافية من خط الإعلان.",
  openGraph: {
    title: "تنظيم معارض وفعاليات | خط الإعلان",
    description:
      "خدمات تنظيم وتجهيز المعارض والفعاليات وتصميم الأجنحة والمساحات باحترافية من خط الإعلان.",
  },
};
export default function ExhibitionsPage() {
  return <ExhibitionCatalog />;
}
