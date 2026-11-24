import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";

export default async function AssignedExamPage({ params }: { params: { assignmentId: string } }) {
  const { assignmentId } = params;
  const response = await backendPost(`exam/assignments/${encodeURIComponent(assignmentId)}`,
    getSessionCredentials({ cookies: cookies() }));
  if (response.status === 401) redirect(`/login?next=${encodeURIComponent(`/dashboard/tests/${assignmentId}`)}`);
  if (response.status === 400 || response.status === 404) notFound();
  if (!response.ok) throw new Error("Assigned exam is unavailable");

  const { testId } = await response.json() as { testId?: string };
  if (!testId) throw new Error("Assigned exam reference is unavailable");
  redirect(`/test/${encodeURIComponent(testId)}`);
}
