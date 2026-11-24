import { NextRequest, NextResponse } from "next/server";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";

export async function POST(request: NextRequest, { params }: { params: { reference: string } }) {
  try {
    const response = await backendPost(`exam/assignments/test/${encodeURIComponent(params.reference)}/start`, getSessionCredentials(request));
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "The exam is temporarily unavailable." }, { status: 503 });
  }
}
