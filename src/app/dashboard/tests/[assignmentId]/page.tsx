import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";
import { applyBoardChanges, EMPTY_BOARD, type BoardUpdate } from "@/features/board/domain/boardSync";
import type { SheetLayout } from "@/features/design/domain/sheetLayout";
import { DesignSheet } from "@/features/design/ui/DesignSheet";
import { PublishedExam } from "@/features/design/ui/PublishedExam";

export default async function AssignedExamPage({ params }: { params: { assignmentId: string } }) {
  const { assignmentId } = params;
  const response = await backendPost(`exam/assignments/${encodeURIComponent(assignmentId)}`,
    getSessionCredentials({ cookies: cookies() }));
  if (response.status === 401) redirect(`/login?next=${encodeURIComponent(`/dashboard/tests/${assignmentId}`)}`);
  if (response.status === 400 || response.status === 404) notFound();
  if (!response.ok) throw new Error("Assigned exam is unavailable");

  const { title, layout, snapshot, testId } = await response.json() as { title: string; layout: SheetLayout; snapshot: BoardUpdate; testId?: string };
  if (testId) redirect(`/test/${testId}`);
  return (
    <main className="mx-auto w-full" style={{ maxWidth: layout.width }}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-100 px-4 py-3">
        <Link href="/dashboard?role=student" className="text-sm font-semibold text-cyan-800 hover:underline">Assigned tests</Link>
        <h1 className="min-w-0 break-words font-bold">{title}</h1>
      </header>
      <PublishedExam key={assignmentId}>
        <DesignSheet title={title} layout={layout} board={applyBoardChanges(EMPTY_BOARD, snapshot.changes)} />
      </PublishedExam>
    </main>
  );
}
