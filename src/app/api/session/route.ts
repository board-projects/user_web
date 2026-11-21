import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  LEGACY_ACCESS_COOKIE,
  getSessionCredentials,
  accessCookieOptions,
  authRequest,
} from "@/features/auth/services/session.server";

function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  return !origin || origin === req.nextUrl.origin || origin === `https://${host}` || origin === `http://${host}`;
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
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

export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  try {
    const { refresh_token } = getSessionCredentials(req);
    if (refresh_token) {
      const upstream = await authRequest("logout", { refresh_token });
      if (!upstream.ok) throw new Error("Session revocation failed");
    }

    const response = new NextResponse(null, { status: 204 });
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    response.cookies.delete(LEGACY_ACCESS_COOKIE);
    if (req.nextUrl.hostname === "dequizma.com" || req.nextUrl.hostname.endsWith(".dequizma.com")) {
      response.headers.append("Set-Cookie", `${LEGACY_ACCESS_COOKIE}=; Domain=dequizma.com; Path=/; Max-Age=0; Secure; SameSite=Lax`);
    }
    return response;
  } catch {
    return NextResponse.json({ message: "Unable to sign out. Please retry." }, { status: 502 });
  }
}
