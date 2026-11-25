import { ExamGradeSummary, type ExamGrade } from "@/features/design/ui/ExamGradeSummary";
import { ExamEntry, type ExamAccess } from "@/features/design/ui/ExamEntry";
import { PublishedExam } from "@/features/design/ui/PublishedExam";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { backendPost, backendRequest, getSessionCredentials } from "@/features/auth/services/session.server";
import { applyBoardChanges, EMPTY_BOARD, type BoardUpdate } from "@/features/board/domain/boardSync";
import type { SheetLayout } from "@/features/design/domain/sheetLayout";
import { DesignSheet } from "@/features/design/ui/DesignSheet";

export const dynamic = "force-dynamic";

type Props = { params: { reference: string } };

type TestPage = { title: string; layout: SheetLayout; snapshot?: BoardUpdate; access?: ExamAccess; submittedAt?: string | null; answers?: Record<string, string[]>; grade?: ExamGrade };

const getPublishedPage = cache(async (reference: string): Promise<{ page: TestPage; assigned: boolean }> => {
  const id = encodeURIComponent(reference);
  const credentials = getSessionCredentials({ cookies: cookies() });
  const hasSession = Boolean(credentials.access_token || credentials.refresh_token);
  let authenticationRequired = !hasSession;
  if (hasSession) {
    const assigned = await backendPost(`exam/assignments/test/${id}`, credentials);
    if (assigned.ok) return { page: await assigned.json(), assigned: true };
    if (assigned.status === 400) notFound();
    if (assigned.status !== 404 && assigned.status !== 401) throw new Error("Assigned exam is unavailable");
    authenticationRequired = assigned.status === 401;
  }

  const response = await backendRequest(`boards/${id}/published`);
  if (response.ok) return { page: await response.json(), assigned: false };
  if (response.status === 400) notFound();
  if (response.status !== 404) throw new Error("Published page is unavailable");
  if (authenticationRequired) redirect(`/login?next=${encodeURIComponent(`/test/${reference}`)}`);
  notFound();
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: { title }, assigned } = await getPublishedPage(params.reference);
  return { title, ...(assigned && { robots: { index: false, follow: false } }) };
}

export default async function PublishedTestPage({ params }: Props) {
  const { page: { title, layout, snapshot, submittedAt, answers, grade, access }, assigned } = await getPublishedPage(params.reference);
  if (assigned && !submittedAt && access && access.status !== "open") {
    return <ExamEntry reference={params.reference} title={title} access={access} />;
  }
  if (!snapshot) notFound();
  const board = applyBoardChanges(EMPTY_BOARD, snapshot.changes);

  return (
    <main className="mx-auto w-full" style={{ maxWidth: layout.width }}>
      {assigned && submittedAt && grade && <ExamGradeSummary grade={grade} />}
      <PublishedExam key={`${params.reference}:${submittedAt ?? "open"}`} reference={assigned ? params.reference : undefined} submitted={Boolean(submittedAt)} access={assigned ? access : undefined}>
        <DesignSheet board={board} layout={layout} title={title} answers={answers} />
      </PublishedExam>
    </main>
  );
}
