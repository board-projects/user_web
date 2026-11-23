import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  authRequest,
  getSessionCredentials,
} from "@/features/auth/services/session.server";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/test/")) return NextResponse.next();

  const credentials = getSessionCredentials(req);
  const accessToken = credentials.access_token;

  const loginUrl = new URL("/login", req.url);
  const destination = req.nextUrl.clone();
  destination.searchParams.delete("_rsc");
  loginUrl.searchParams.set("next", destination.pathname + destination.search);

  if (!accessToken && !credentials.refresh_token) return NextResponse.redirect(loginUrl);

  try {
    const upstream = await authRequest("session", credentials);

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
  matcher: ["/board/:path*", "/dashboard/:path*", "/test/:reference"],
};
