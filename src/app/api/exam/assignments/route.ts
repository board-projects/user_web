import { NextRequest, NextResponse } from "next/server";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";

const identifier = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;

export async function POST(request: NextRequest) {
  const credentials = getSessionCredentials(request);
  if (!credentials.access_token && !credentials.refresh_token) {
    return NextResponse.json({ message: "Sign in to assign the exam." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.reference !== "string" || !identifier.test(body.reference) ||
      typeof body.pageId !== "string" || !identifier.test(body.pageId)) {
    return NextResponse.json({ message: "Invalid board or page." }, { status: 400 });
  }
  try {
    const response = await backendPost(`exam/assignments/board/${body.reference}/pages/${body.pageId}`,
      { ...credentials, draft: body.draft, emails: body.emails });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Exam assignment is temporarily unavailable." }, { status: 503 });
  }
}
