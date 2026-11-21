import { NextRequest, NextResponse } from "next/server";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";

export const dynamic = "force-dynamic";

async function forward(req: NextRequest, path: string, payload: object = {}) {
  const credentials = getSessionCredentials(req);
  if (!credentials.access_token && !credentials.refresh_token) {
    return NextResponse.json({ message: "Sign in to view your boards" }, { status: 401 });
  }

  try {
    const upstream = await backendPost(path, { ...payload, ...credentials });
    const body = await upstream.json();
    return NextResponse.json(body, {
      status: upstream.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ message: "Boards are temporarily unavailable" }, { status: 502 });
  }
}

export function GET(req: NextRequest) {
  return forward(req, "boards/list");
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && origin !== req.nextUrl.origin && origin !== `https://${host}` && origin !== `http://${host}`) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  try {
    const body = await req.json();
    return forward(req, "boards", { title: body?.title });
  } catch {
    return NextResponse.json({ message: "Enter a board name" }, { status: 400 });
  }
}
