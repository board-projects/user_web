import type { ReactNode } from "react";

export function QuestionCard({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div data-board-scroll className="h-full touch-pan-y overflow-y-auto rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-900">
      {label && <div className="mb-1 break-words text-xs font-semibold text-stone-500">{label}</div>}
      {children}
    </div>
  );
}

export function QuestionEditorCard({ title, done, children, footer }: {
  title: string;
  done: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div data-question-editor data-board-scroll className="h-full touch-pan-y overflow-auto rounded-lg border border-stone-200 bg-white text-stone-900">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 py-1">
        <span className="truncate text-xs font-semibold">{title}</span>
        <button type="button" className="min-h-8 rounded-md px-2 text-xs font-medium text-blue-700 hover:bg-blue-50" onClick={done}>Done</button>
      </div>
      <div className="grid gap-3 p-3">{children}</div>
      {footer && <div className="sticky bottom-0 border-t border-stone-200 bg-white px-3 py-1.5">{footer}</div>}
    </div>
  );
}
