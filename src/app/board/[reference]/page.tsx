"use client";

import { useParams } from "next/navigation";
import { BoardEditor } from "@/features/board/ui/BoardEditor";

export default function BoardPage() {
  const { reference } = useParams<{ reference: string }>();
  return <BoardEditor key={reference} reference={reference} />;
}
