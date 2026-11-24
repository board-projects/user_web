export type ExamGrade = {
  earned: number;
  possible: number;
  pendingManual: number;
  unconfigured: number;
};

const scoreFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });

export function ExamGradeSummary({ grade }: { grade: ExamGrade }) {
  return (
    <section aria-label="Exam result" className="grid gap-1 border-b border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
      {grade.possible > 0 ? (
        <p className="font-semibold">Auto-graded score: {scoreFormat.format(grade.earned)} / {grade.possible}</p>
      ) : (
        <p className="font-semibold">No auto-graded score available.</p>
      )}
      {grade.pendingManual > 0 && <p>Essay questions awaiting manual grading: {grade.pendingManual}</p>}
      {grade.unconfigured > 0 && <p>Questions without a configured answer key: {grade.unconfigured}</p>}
    </section>
  );
}
