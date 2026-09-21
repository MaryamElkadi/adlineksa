import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

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

export async function getCurrentUser() {
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

    await connectToDatabase();
    const user = await User.findById(decoded.id).select("-password").lean();

    return user;
  } catch {
    return null;
  }
}