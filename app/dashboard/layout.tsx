import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/currentUser";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  return children;
}
