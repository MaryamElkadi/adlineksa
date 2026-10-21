import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/currentUser";
import { isAdminUser } from "@/lib/roles";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
