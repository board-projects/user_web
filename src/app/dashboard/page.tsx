import type { Metadata } from "next";
import Link from "next/link";
import { BoardDirectory } from "@/features/dashboard/ui/BoardDirectory";

export const metadata: Metadata = { title: "Your boards | DeQuizMa" };

export default function DashboardPage() {
  return (
    <main className="min-h-dvh bg-cyan-50 px-4 py-6 text-cyan-950 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7">
          <Link href="/" className="inline-flex min-h-10 items-center text-sm font-bold text-cyan-800 hover:underline">
            DeQuizMa
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Your boards</h1>
        </header>
        <BoardDirectory />
      </div>
    </main>
  );
}
