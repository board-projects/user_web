"use client";

import { useState, type ReactNode } from "react";

export function PublishedExam({ children }: { children: ReactNode }) {
  const [finished, setFinished] = useState(false);

  return (
    <>
      <fieldset disabled={finished} className="m-0 min-w-0 border-0 p-0">
        {children}
      </fieldset>
      <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 px-4 py-4">
        <span role="status" className="text-sm font-medium text-stone-600">
          {finished ? "Exam finished." : ""}
        </span>
        <button type="button" disabled={finished} onClick={() => setFinished(true)}
          className="min-h-11 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-stone-200 disabled:text-stone-700">
          Finish exam
        </button>
      </footer>
    </>
  );
}
