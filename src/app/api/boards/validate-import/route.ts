import { NextRequest, NextResponse } from "next/server";
import { backendPost } from "@/features/auth/services/session.server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const response = await backendPost("boards/validate-import", { changes: data?.changes });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Unable to validate this board JSON" }, { status: 502 });
  }
}
