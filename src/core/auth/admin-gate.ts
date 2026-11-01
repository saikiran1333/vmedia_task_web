export const ADMIN_COOKIE_NAME = "vmedia_admin_session";

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isAdminLoginPath(pathname: string) {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

export function adminGate(pathname: string, hasSessionCookie: boolean): "allow" | "login" {
  if (!isAdminPath(pathname) || isAdminLoginPath(pathname)) return "allow";
  return hasSessionCookie ? "allow" : "login";
}

export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//") || value.includes("://")) return "/admin";
  if (value.startsWith("/admin/login")) return "/admin";
  return value;
}

export function toPublicAdmin(admin: { id: string; email: string; name: string; token?: string }) {
  return { id: admin.id, email: admin.email, name: admin.name };
}
