import { NextRequest, NextResponse } from "next/server";
import { backendPost } from "@/features/auth/services/session.server";

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && origin !== req.nextUrl.origin && origin !== `https://${host}` && origin !== `http://${host}`) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  let snapshot: object;
  try {
    snapshot = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid page snapshot" }, { status: 400 });
  }

  try {
    const response = await backendPost("boards/publications", snapshot);
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Publication is temporarily unavailable" }, { status: 502 });
  }
}
