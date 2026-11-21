import { NextRequest, NextResponse } from "next/server";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";

export const dynamic = "force-dynamic";

type RouteContext = { params: { reference: string } };

async function forward(req: NextRequest, reference: string, action: "title" | "rename", payload: object = {}) {
  const credentials = getSessionCredentials(req);
  if (!credentials.access_token && !credentials.refresh_token) {
    return NextResponse.json({ message: "Sign in to view the board" }, { status: 401 });
  }

  try {
    const response = await backendPost(`boards/${encodeURIComponent(reference)}/${action}`, { ...credentials, ...payload });
    return NextResponse.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ message: "Board name is unavailable" }, { status: 502 });
  }
}

export function GET(req: NextRequest, { params }: RouteContext) {
  return forward(req, params.reference, "title");
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && origin !== req.nextUrl.origin && origin !== `https://${host}` && origin !== `http://${host}`) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  try {
    const data = await req.json();
    return forward(req, params.reference, "rename", { title: data?.title });
  } catch {
    return NextResponse.json({ message: "Enter a board name" }, { status: 400 });
  }
}
