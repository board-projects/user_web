export type BoardSummary = {
  reference: string;
  title: string;
  createdAt: string;
};

async function boardRequest<T>(init?: RequestInit): Promise<T> {
  const response = await fetch("/api/boards", { cache: "no-store", ...init });
  if (response.status === 401) {
    window.location.assign("/login?next=/dashboard");
    throw new Error("Sign in to access your boards");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.message === "string" ? body.message : "Unable to access your boards");
  }

  return response.json();
}

export const listBoards = (signal: AbortSignal) => boardRequest<BoardSummary[]>({ signal });

export const createBoard = (title: string) => boardRequest<BoardSummary>({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title }),
});

export const boardPath = (reference: string) => `/board/${encodeURIComponent(reference)}`;
