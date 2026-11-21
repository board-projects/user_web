import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  LEGACY_ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  authRequest,
} from "@/features/auth/services/session.server";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value ?? req.cookies.get(LEGACY_ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  const loginUrl = new URL("/login", req.url);
  const destination = req.nextUrl.clone();
  destination.searchParams.delete("_rsc");
  loginUrl.searchParams.set("next", destination.pathname + destination.search);

  if (!accessToken && !refreshToken) return NextResponse.redirect(loginUrl);

  try {
    const upstream = await authRequest("session", {
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (upstream.status === 401) {
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }

    if (upstream.ok) {
      const { access_token: token } = await upstream.json();
      if (typeof token === "string" && token) {
        const response = NextResponse.next();
        if (token !== accessToken) {
          response.cookies.set(ACCESS_COOKIE, token, accessCookieOptions(process.env.NODE_ENV === "production"));
        }
        return response;
      }
    }
  } catch {
    // A temporary backend outage should not clear the user's session.
  }

  return new NextResponse("Board login is temporarily unavailable. Please try again.", { status: 503 });
}

export const config = {
  matcher: ["/board/:path*"],
};
