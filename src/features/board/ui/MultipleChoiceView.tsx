import { useId } from "react";
import { allowsMultipleAnswers, type MultipleChoiceItem } from "../domain/multipleChoice";
import { getTextStyles } from "../domain/textFormat";
import { TextLink } from "./TextLink";

export function MultipleChoiceView({ item, answering = false, selection }: { item: MultipleChoiceItem; answering?: boolean; selection?: string[] }) {
  const name = useId();
  const multiple = allowsMultipleAnswers(item);
  const prompt = item.prompt.trim() || "Question";
  const inputType = multiple ? "checkbox" : "radio";

  return (
    <div className="h-full overflow-y-auto rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-900">
      {item.label && <div className="mb-1 text-xs font-semibold text-stone-500">{item.label}</div>}
      <fieldset className="min-w-0" style={getTextStyles(item.textFormat, "left")}>
        <legend className="w-full whitespace-pre-wrap break-words">
          <TextLink link={answering ? item.textFormat?.link : undefined}>{prompt}</TextLink>
        </legend>
        <p className="mt-1 text-xs text-stone-500">{multiple ? "Select all that apply" : "Choose one answer"}</p>
        <div className="mt-3 grid gap-1.5">
          {item.options.map((option, index) => (
            <label key={option.id} className="flex gap-2 rounded-md border border-stone-100 px-2 py-1.5">
              {answering ? (
                <input type={inputType} name={name} value={option.id} data-question-id={item.id} defaultChecked={selection?.includes(option.id)} className="mt-1 h-4 w-4 shrink-0 accent-blue-600" />
              ) : (
                <span aria-hidden="true" className={`mt-1 h-3.5 w-3.5 shrink-0 border ${multiple ? "rounded-sm" : "rounded-full"} ${option.correct ? "border-emerald-600 bg-emerald-600" : "border-stone-400"}`} />
              )}
              <span className="min-w-0 whitespace-pre-wrap break-words">{option.text || `Option ${index + 1}`}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
