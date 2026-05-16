import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/board"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      console.log(`[Middleware] No token found for path: ${pathname}`);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const parts = token.split(".");
    const isValidStructure = parts.length === 3;

    if (!isValidStructure) {
      console.log(`[Middleware] Invalid JWT structure for path: ${pathname}`);
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("access_token");
      return response;
    }

    console.log(`[Middleware] Access granted to: ${pathname}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.svg|fonts|images).*)",
  ],
};