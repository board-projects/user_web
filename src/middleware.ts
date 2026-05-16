import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = [
  "/board/:id"
];

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "a_very_long_and_secure_default_secret_32_chars_or_more"
);
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return !!payload; 
  } catch (err) {
    console.error("JWT Verification failed:", err);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const isValid = await verifyToken(token);
    if (!isValid) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|fonts|images).*)",
  ],
};