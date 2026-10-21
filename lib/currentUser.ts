import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/authCookie";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import RevokedSession from "@/models/RevokedSession";

const USER_SAFE_SELECT = "-password -resetPasswordToken -resetPasswordExpires";

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?._id?.toString() || null;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded?.id) {
      return null;
    }

    await connectToDatabase();
    const user = await User.findById(decoded.id).select(USER_SAFE_SELECT);

    if (
      !user ||
      user.isActive === false ||
      (user.sessionVersion || 0) !== decoded.sessionVersion
    ) {
      return null;
    }

    if (decoded.jti && await RevokedSession.exists({ _id: decoded.jti })) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
