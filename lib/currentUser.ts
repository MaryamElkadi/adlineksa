import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function getCurrentUserId() {
  const cookieStore = await cookies();

  const token = cookieStore.get("adline_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded: any = verifyToken(token);

    if (!decoded?.id) {
      return null;
    }

    return decoded.id;
  } catch {
    return null;
  }
}