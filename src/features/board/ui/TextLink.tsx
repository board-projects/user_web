import type { ReactNode } from "react";
import { safeTextLink } from "../domain/textFormat";

export function TextLink({ link, children }: { link?: string; children: ReactNode }) {
  const href = safeTextLink(link);
  if (!href) return children;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">
      {children}
    </a>
  );
}
