import { useRef } from "react";
import { getTextStyles, type TextFormat } from "../domain/textFormat";

export function ClozeQuestionEditor({ content, textFormat, update, done }: {
  content: string;
  textFormat?: TextFormat;
  update: (content: string) => void;
  done: () => void;
}) {
  const input = useRef<HTMLTextAreaElement>(null);
  const addBlank = () => {
    const start = input.current?.selectionStart ?? content.length;
    const end = input.current?.selectionEnd ?? start;
    const answer = content.slice(start, end) || "answer";
    update(`${content.slice(0, start)}{{${answer}}}${content.slice(end)}`);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(start + 2, start + 2 + answer.length);
    });
  };

  return (
    <div data-cloze-editor className="grid gap-2">
      <textarea ref={input} autoFocus rows={3} aria-label="Question text" value={content}
        onChange={(event) => update(event.currentTarget.value)}
        style={getTextStyles(textFormat, "left")}
        className="w-full resize-y rounded-md border border-stone-300 bg-transparent p-2 leading-snug outline-none focus:border-blue-500" />
      <p className="text-xs text-stone-600">Put each correct answer inside {"{{ }}"}.</p>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <button type="button" className="min-h-9 rounded-md border border-stone-200 px-2" onClick={addBlank}>Add blank</button>
        <button type="button" className="min-h-9 rounded-md px-2 text-blue-700" onClick={done}>Done</button>
      </div>
    </div>
  );
}
