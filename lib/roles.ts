export type AuthUser = {
  role?: string | null;
  isActive?: boolean | null;
};

export function isAdminUser(user: AuthUser | null | undefined): boolean {
  return Boolean(user && user.role === "admin" && user.isActive !== false);
}
