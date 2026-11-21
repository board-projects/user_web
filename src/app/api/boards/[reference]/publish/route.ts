import { NextRequest, NextResponse } from "next/server";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";

export async function POST(req: NextRequest, { params }: { params: { reference: string } }) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && origin !== req.nextUrl.origin && origin !== `https://${host}` && origin !== `http://${host}`) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const credentials = getSessionCredentials(req);
  if (!credentials.access_token && !credentials.refresh_token) {
    return NextResponse.json({ message: "Sign in to publish this page" }, { status: 401 });
  }

  try {
    const layout = await req.json();
    const response = await backendPost(`boards/${encodeURIComponent(params.reference)}/publish`, { ...credentials, layout });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Unable to publish this page" }, { status: 502 });
  }
}
