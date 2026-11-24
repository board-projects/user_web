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

type TestPage = { title: string; layout: SheetLayout; snapshot: BoardUpdate; submittedAt?: string | null; answers?: Record<string, string[]> };

const getPublishedPage = cache(async (reference: string): Promise<{ page: TestPage; assigned: boolean }> => {
  const response = await backendRequest(`boards/${encodeURIComponent(reference)}/published`);
  if (response.ok) return { page: await response.json(), assigned: false };
  if (response.status === 400) notFound();
  if (response.status !== 404) throw new Error("Published page is unavailable");

  const assigned = await backendPost(`exam/assignments/test/${encodeURIComponent(reference)}`, getSessionCredentials({ cookies: cookies() }));
  if (assigned.status === 401) redirect(`/login?next=${encodeURIComponent(`/test/${reference}`)}`);
  if (assigned.status === 400 || assigned.status === 404) notFound();
  if (!assigned.ok) throw new Error("Assigned exam is unavailable");
  return { page: await assigned.json(), assigned: true };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: { title } } = await getPublishedPage(params.reference);
  return { title };
}

export default async function PublishedTestPage({ params }: Props) {
  const { page: { title, layout, snapshot, submittedAt, answers }, assigned } = await getPublishedPage(params.reference);
  const board = applyBoardChanges(EMPTY_BOARD, snapshot.changes);

  return (
    <main className="mx-auto w-full" style={{ maxWidth: layout.width }}>
      <PublishedExam key={params.reference} reference={assigned ? params.reference : undefined} submitted={Boolean(submittedAt)}>
        <DesignSheet board={board} layout={layout} title={title} answers={answers} />
      </PublishedExam>
    </main>
  );
}
