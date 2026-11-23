import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BoardDirectory } from "@/features/dashboard/ui/BoardDirectory";
import { getExamDashboard } from "@/features/dashboard/services/examDashboard.server";
import { SwitchAccountButton } from "@/features/dashboard/ui/SwitchAccountButton";

export const metadata: Metadata = { title: "Dashboard | DeQuizMa" };

const statusText: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  submitted: "Submitted",
  in_progress: "In progress",
  assigned: "Assigned",
};

export default async function DashboardPage({ searchParams }: { searchParams: { role?: string } }) {
  const role = searchParams.role === "teacher" || searchParams.role === "student" ? searchParams.role : undefined;
  const dashboardPath = role ? `/dashboard?role=${role}` : "/dashboard";
  const loginPath = `/login?next=${encodeURIComponent(dashboardPath)}`;
  const result = await getExamDashboard(role);
  if (result.status === "unauthorized") redirect(loginPath);

  return (
    <main className="min-h-dvh bg-cyan-50 px-4 py-6 text-cyan-950 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/" className="inline-flex min-h-10 items-center text-sm font-bold text-cyan-800 hover:underline">DeQuizMa</Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
              {result.status === "success" ? result.data.role === "teacher" ? "Teacher dashboard" : "Student dashboard" : "Dashboard"}
            </h1>
          </div>
          <SwitchAccountButton loginPath={loginPath} />
        </header>
        {result.status === "forbidden" && (
          <p className="rounded-xl border border-cyan-200 bg-white p-4">
            {role ? `This account does not have the ${role} role. Switch to an account registered as a ${role}.`
              : "This account does not have a dashboard role. Contact your administrator to set it up."}
          </p>
        )}
        {result.status === "unavailable" && <p role="alert">The dashboard is temporarily unavailable. Please try again.</p>}
        {result.status === "success" && (
          <div className="grid gap-7">
            {result.data.roles.length > 1 && (
              <nav aria-label="Dashboards" className="flex flex-wrap gap-3 text-sm font-semibold">
                {result.data.roles.map((availableRole) => (
                  <Link key={availableRole} href={`/dashboard?role=${availableRole}`}
                    aria-current={availableRole === result.data.role ? "page" : undefined}
                    className="capitalize underline decoration-cyan-600 underline-offset-4">{availableRole}</Link>
                ))}
              </nav>
            )}
            {result.data.role === "teacher" && (
              <section aria-label="Your boards"><h2 className="mb-3 text-xl font-bold">Your boards</h2><BoardDirectory /></section>
            )}
            <section aria-label="Tests">
              <h2 className="mb-3 text-xl font-bold">{result.data.role === "teacher" ? "Your tests" : "Assigned tests"}</h2>
              {result.data.tests.length ? (
                <ul className="grid gap-2">
                  {result.data.tests.map((test) => (
                    <li key={test.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-3">
                      {result.data.role === "student"
                        ? <Link className="min-w-0 break-words font-semibold text-cyan-900 hover:underline" href={`/dashboard/tests/${test.id}`}>{test.label || "Untitled test"}</Link>
                        : <span className="min-w-0 break-words font-semibold">{test.label || "Untitled test"}</span>}
                      <span className="text-sm text-cyan-800">{statusText[test.status] ?? test.status}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="rounded-xl border border-cyan-200 bg-white p-4">{result.data.role === "teacher" ? "You have no tests yet." : "No tests have been assigned to you yet."}</p>}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
