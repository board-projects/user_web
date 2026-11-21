import { NextRequest, NextResponse } from "next/server";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { reference: string } }) {
  const credentials = getSessionCredentials(req);
  if (!credentials.access_token && !credentials.refresh_token) {
    return NextResponse.json({ message: "Sign in to view the board" }, { status: 401 });
  }

  try {
    const response = await backendPost(`boards/${encodeURIComponent(params.reference)}/title`, credentials);
    return NextResponse.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ message: "Board name is unavailable" }, { status: 502 });
  }
}
