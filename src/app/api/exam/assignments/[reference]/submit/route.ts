import { NextRequest, NextResponse } from "next/server";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";

export async function POST(request: NextRequest, { params }: { params: { reference: string } }) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid answers." }, { status: 400 });

  try {
    const response = await backendPost(`exam/assignments/test/${encodeURIComponent(params.reference)}/submit`,
      { ...getSessionCredentials(request), answers: body.answers });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Exam submission is temporarily unavailable." }, { status: 503 });
  }
}
