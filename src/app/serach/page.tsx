import { permanentRedirect } from "next/navigation";

export default function SearchAlias({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") params.append(key, value);
    else value?.forEach((item) => params.append(key, item));
  }
  permanentRedirect(params.size ? `/search?${params}` : "/search");
}
