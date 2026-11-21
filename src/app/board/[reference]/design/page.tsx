import { redirect } from "next/navigation";

export default function LegacyBoardDesignPage({ params }: { params: { reference: string } }) {
  redirect(`/board/${encodeURIComponent(params.reference)}`);
}
