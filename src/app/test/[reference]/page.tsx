import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { backendRequest } from "@/features/auth/services/session.server";
import { applyBoardChanges, EMPTY_BOARD, type BoardUpdate } from "@/features/board/domain/boardSync";
import type { SheetLayout } from "@/features/design/domain/sheetLayout";
import { DesignSheet } from "@/features/design/ui/DesignSheet";

export const dynamic = "force-dynamic";

type Props = { params: { reference: string } };

const getPublishedPage = cache(async (reference: string) => {
  const response = await backendRequest(`boards/${encodeURIComponent(reference)}/published`);
  if (response.status === 404 || response.status === 400) notFound();
  if (!response.ok) throw new Error("Published page is unavailable");

  return await response.json() as { title: string; layout: SheetLayout; snapshot: BoardUpdate };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { title } = await getPublishedPage(params.reference);
  return { title };
}

export default async function PublishedTestPage({ params }: Props) {
  const { title, layout, snapshot } = await getPublishedPage(params.reference);
  const board = applyBoardChanges(EMPTY_BOARD, snapshot.changes);

  return (
    <main className="mx-auto w-full" style={{ maxWidth: layout.width }}>
      <DesignSheet board={board} layout={layout} title={title} />
    </main>
  );
}
