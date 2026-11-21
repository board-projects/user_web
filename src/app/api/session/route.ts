import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  authRequest,
} from "@/features/auth/services/session.server";

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  try {
    const { email, code } = await req.json();
    const upstream = await authRequest("verify-otp", { email, code });
    const data = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json({ message: data.message }, { status: upstream.status });
    }

    const expires = new Date(data.session_expires_at);
    if (!data.access_token || !data.refresh_token || !Number.isFinite(expires.getTime())) {
      return NextResponse.json({ message: "Unable to start session" }, { status: 502 });
    }

    const response = NextResponse.json({ message: data.message, user: data.user });
    const options = accessCookieOptions(process.env.NODE_ENV === "production");
    response.cookies.set(ACCESS_COOKIE, data.access_token, options);
    response.cookies.set(REFRESH_COOKIE, data.refresh_token, {
      httpOnly: options.httpOnly,
      secure: options.secure,
      sameSite: options.sameSite,
      path: options.path,
      expires,
    });
    return response;
  } catch {
    return NextResponse.json({ message: "Unable to start session" }, { status: 502 });
  }
}
