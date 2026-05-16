import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "a_very_long_and_secure_default_secret_32_chars_or_more"
);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return !!payload; 
  } catch (err) {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/board")) {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const isValid = await verifyToken(token);
    if (!isValid) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("access_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/board/:reference*"],
};