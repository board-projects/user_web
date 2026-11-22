import type { TextFormat } from "./textFormat";

export type TextRange = { start: number; end: number };
export type TextRun = TextRange & { format: TextFormat };

export function textSegments(text: string, runs: readonly TextRun[], base?: TextFormat) {
  const segments: Array<TextRun & { text: string }> = [];
  const boundaries = [...new Set([0, text.length, ...runs.flatMap(({ start, end }) => [
    Math.max(0, Math.min(start, text.length)), Math.max(0, Math.min(end, text.length)),
  ])])].sort((a, b) => a - b);

  let index = 0;
  for (let i = 1; i < boundaries.length; i++) {
    const start = boundaries[i - 1];
    const end = boundaries[i];
    while (runs[index] && runs[index].end <= start) index++;
    const run = runs[index];
    segments.push({ start, end, text: text.slice(start, end), format: {
      ...base, ...(run && run.start <= start ? run.format : undefined),
    } });
  }
  return segments;
}

export function applyTextFormat(text: string, runs: readonly TextRun[], range: TextRange, format: TextFormat): TextRun[] {
  if (range.start >= range.end) return [...runs];
  const boundaries = [
    ...runs.filter((run) => run.start < range.start).map((run) => ({ ...run, end: Math.min(run.end, range.start) })),
    ...textSegments(text.slice(range.start, range.end), runs
      .filter((run) => run.end > range.start && run.start < range.end)
      .map((run) => ({ ...run, start: run.start - range.start, end: run.end - range.start })))
      .map((run) => ({ start: run.start + range.start, end: run.end + range.start, format: { ...run.format, ...format } })),
    ...runs.filter((run) => run.end > range.end).map((run) => ({ ...run, start: Math.max(run.start, range.end) })),
  ];
  return boundaries.reduce<TextRun[]>((merged, run) => {
    const previous = merged.at(-1);
    if (previous?.end === run.start && JSON.stringify(previous.format) === JSON.stringify(run.format)) previous.end = run.end;
    else merged.push(run);
    return merged;
  }, []);
}

export function updateTextRuns(previous: string, next: string, runs: readonly TextRun[]): TextRun[] {
  if (previous === next) return [...runs];
  let start = 0;
  while (start < previous.length && start < next.length && previous[start] === next[start]) start++;
  let oldEnd = previous.length;
  let newEnd = next.length;
  while (oldEnd > start && newEnd > start && previous[oldEnd - 1] === next[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  const delta = newEnd - oldEnd;
  return runs.flatMap((run) => {
    if (run.end <= start) return [run];
    if (run.start >= oldEnd) return [{ ...run, start: run.start + delta, end: run.end + delta }];
    const before = run.start < start ? [{ ...run, end: start }] : [];
    const after = run.end > oldEnd ? [{ ...run, start: newEnd, end: run.end + delta }] : [];
    if (before.length && after.length) return [{ ...run, end: run.end + delta }];
    return [...before, ...after];
  });
}

export function paragraphRange(text: string, range: TextRange): TextRange {
  const start = range.start === 0 ? 0 : text.lastIndexOf("\n", range.start - 1) + 1;
  const lineEnd = text.indexOf("\n", Math.max(range.start, range.end - 1));
  return { start, end: lineEnd === -1 ? text.length : lineEnd };
}

export function textParagraphs(text: string, runs: readonly TextRun[], base?: TextFormat) {
  let offset = 0;
  return text.split("\n").map((line) => {
    const start = offset;
    offset += line.length + 1;
    const segments = textSegments(line, runs.filter((run) => run.end > start && run.start < start + line.length)
      .map((run) => ({ ...run, start: run.start - start, end: run.end - start })), base);
    return { start, align: segments[0]?.format.align ?? base?.align ?? "center", segments };
  });
}
