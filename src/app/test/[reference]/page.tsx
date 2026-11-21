import { notFound } from "next/navigation";
import { backendRequest } from "@/features/auth/services/session.server";
import { applyBoardChanges, EMPTY_BOARD, type BoardUpdate } from "@/features/board/domain/boardSync";
import type { SheetLayout } from "@/features/design/domain/sheetLayout";
import { DesignSheet } from "@/features/design/ui/DesignSheet";

export const dynamic = "force-dynamic";

export default async function PublishedTestPage({ params }: { params: { reference: string } }) {
  const response = await backendRequest(`boards/${encodeURIComponent(params.reference)}/published`);
  if (response.status === 404 || response.status === 400) notFound();
  if (!response.ok) throw new Error("Published page is unavailable");

  const { title, layout, snapshot } = await response.json() as {
    title: string; layout: SheetLayout; snapshot: BoardUpdate;
  };
  const board = applyBoardChanges(EMPTY_BOARD, snapshot.changes);

  return (
    <main className="min-h-dvh bg-cyan-50 px-3 py-6 sm:px-6">
      <article className="mx-auto" style={{ maxWidth: layout.width }}>
        <h1 className="mb-4 break-words text-2xl font-bold text-cyan-950">{title}</h1>
        <div className="overflow-hidden bg-white shadow-sm ring-1 ring-cyan-100">
          <DesignSheet board={board} layout={layout} title={title} />
        </div>
      </article>
    </main>
  );
}
