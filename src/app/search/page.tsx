import Link from "next/link";
import { backendRequest } from "@/features/auth/services/session.server";
import { examLevels, examLocales, examSorts } from "@/features/catalog/filters";

export const metadata = { title: "Public exams | DeQuizMa", description: "Find public practice exams by topic, level, or language." };

type SearchParams = Record<string, string | string[] | undefined>;
type Result = { reference: string; title: string; topic: string; level: string; locale: string };
type ResultPage = { items: Result[]; hasNext: boolean };

const field = "min-w-0 w-full rounded-md border border-cyan-200 bg-white px-3 py-2";

function value(params: SearchParams, name: string, limit: number) {
  const input = params[name];
  return (typeof input === "string" ? input : input?.[0] ?? "").trim().slice(0, limit);
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const query = value(searchParams, "query", 200);
  const topic = value(searchParams, "topic", 80);
  const level = value(searchParams, "level", 16).toLowerCase();
  const locale = value(searchParams, "locale", 12).toLowerCase();
  const defaultSort = query ? "relevance" : "newest";
  const sortInput = value(searchParams, "sort", 16);
  const sort = Object.hasOwn(examSorts, sortInput) ? sortInput : defaultSort;
  const requestedPage = Number(value(searchParams, "page", 3));
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 499 ? requestedPage : 1;
  const filters = { query, topic, level, locale, sort };
  const params = new URLSearchParams(Object.entries(filters).filter(([, item]) => item));
  const pageLink = (number: number) => `/search?${new URLSearchParams({ ...Object.fromEntries(params), page: String(number) })}`;

  let results: ResultPage | undefined;
  let error = "";
  try {
    const response = await backendRequest(`exam/catalog?${params}&page=${page}`);
    if (response.ok) results = await response.json() as ResultPage;
    else error = response.status === 400 ? "Check your search filters and try again." : "Search is temporarily unavailable.";
  } catch {
    error = "Search is temporarily unavailable.";
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 text-cyan-950">
      <Link href="/" className="justify-self-start text-sm font-semibold underline">DeQuizMa</Link>
      <h1 className="text-2xl font-bold">Public exams</h1>
      <form action="/search" className="grid gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 text-sm font-medium sm:col-span-2 lg:col-span-4">
          Search exams
          <input name="query" type="search" defaultValue={query} maxLength={200} className={field} />
        </label>
        <label className="grid gap-1 text-sm font-medium">Topic
          <input name="topic" defaultValue={topic} maxLength={80} className={field} />
        </label>
        <label className="grid gap-1 text-sm font-medium">Level
          <select name="level" defaultValue={level} className={field}>
            <option value="">Any level</option>
            {examLevels.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">Language
          <select name="locale" defaultValue={locale} className={field}>
            <option value="">Any language</option>
            {examLocales.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">Sort
          <select name="sort" defaultValue={sort} className={field}>
            {Object.entries(examSorts).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <button type="submit" className="justify-self-start rounded-lg bg-cyan-700 px-4 py-2 font-semibold text-white">Search</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {results && (results.items.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {results.items.map(({ reference, title, topic, level, locale }) => (
            <li key={reference}>
              <Link href={`/test/${encodeURIComponent(reference)}`} className="block h-full rounded-xl border border-cyan-100 p-4 hover:bg-cyan-50">
                <h2 className="break-words font-semibold">{title}</h2>
                {(topic || level || locale) && <p className="mt-1 break-words text-sm">{[topic, level.toUpperCase(), locale].filter(Boolean).join(" · ")}</p>}
              </Link>
            </li>
          ))}
        </ul>
      ) : <p>No exams match these filters.</p>)}
      {results && (page > 1 || results.hasNext) && (
        <nav aria-label="Search pages" className="flex flex-wrap gap-4">
          {page > 1 && <Link href={pageLink(page - 1)} className="underline">Previous</Link>}
          {results.hasNext && <Link href={pageLink(page + 1)} className="underline">Next</Link>}
        </nav>
      )}
    </main>
  );
}
