import type { Metadata } from "next";
import ServicesCatalog from "./services-catalog";
export const metadata: Metadata = {
  title: "خدماتنا | خط الإعلان",
  description: "حلول إعلانية وإبداعية متكاملة لنمو علامتك التجارية.",
  openGraph: {
    title: "خدمات خط الإعلان",
    description: "حلول إعلانية وإبداعية متكاملة لنمو علامتك التجارية.",
  },
};
export default function ServicesPage() {
  return <ServicesCatalog />;
}
