export const ACCESS_COOKIE = "board_access_token";
export const REFRESH_COOKIE = "board_refresh_token";
export const LEGACY_ACCESS_COOKIE = "access_token";

export const accessCookieOptions = (secure: boolean) => ({
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 86400,
});

export function authRequest(path: string, body: object) {
  const backend = process.env.API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const base = backend?.startsWith("https://") || backend?.startsWith("http://")
    ? backend
    : "https://back.dequizma.com";

  return fetch(`${base.replace(/\/$/, "")}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}
