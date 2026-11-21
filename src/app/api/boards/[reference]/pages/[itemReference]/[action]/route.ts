import { NextRequest, NextResponse } from "next/server";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";

export async function POST(req: NextRequest, { params }: {
  params: { reference: string; itemReference: string; action: string };
}) {
  const { action, reference, itemReference } = params;
  if (action !== "preview" && action !== "publish") {
    return NextResponse.json({ message: "Page action not found" }, { status: 404 });
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && origin !== req.nextUrl.origin && origin !== `https://${host}` && origin !== `http://${host}`) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }
  const credentials = getSessionCredentials(req);
  if (!credentials.access_token && !credentials.refresh_token) {
    return NextResponse.json({ message: "Sign in to export or publish a page" }, { status: 401 });
  }

  try {
    const path = `boards/${encodeURIComponent(reference)}/pages/${encodeURIComponent(itemReference)}/${action}`;
    const response = await backendPost(path, credentials);
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Page action is temporarily unavailable" }, { status: 502 });
  }
}
