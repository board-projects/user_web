import { cookies } from "next/headers";
import { backendPost, getSessionCredentials } from "@/features/auth/services/session.server";

export type DashboardRole = "teacher" | "student";

type ExamSummary = { id: string; label: string; status: string };
type DashboardOverview = { role: DashboardRole; roles: DashboardRole[]; tests: ExamSummary[] };
type DashboardResult = { status: "success"; data: DashboardOverview } | { status: "unauthorized" | "forbidden" | "unavailable" };

export async function getExamDashboard(role?: DashboardRole): Promise<DashboardResult> {
  try {
    const response = await backendPost("exam/dashboard", { ...getSessionCredentials({ cookies: cookies() }), role });
    if (response.status === 401) return { status: "unauthorized" };
    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) return { status: "unavailable" };
    return { status: "success", data: await response.json() };
  } catch {
    return { status: "unavailable" };
  }
}
