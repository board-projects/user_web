import { useId } from "react";
import { FaTimes } from "react-icons/fa";
import type { MultipleChoiceItem } from "../domain/multipleChoice";
import { getTextStyles } from "../domain/textFormat";
import { useBoardStore } from "../store/board.store";

const inputClass = "w-full resize-y rounded-md border border-stone-300 bg-white p-2 text-sm outline-none focus:border-blue-500";

export function MultipleChoiceEditor({ item }: { item: MultipleChoiceItem }) {
  const updateQuestion = useBoardStore((state) => state.updateQuestion);
  const addOption = useBoardStore((state) => state.addQuestionOption);
  const updateOption = useBoardStore((state) => state.updateQuestionOption);
  const removeOption = useBoardStore((state) => state.removeQuestionOption);
  const stopEditing = useBoardStore((state) => state.stopEditingQuestion);
  const answerGroup = useId();
  const trueFalse = item.kind === "true_false";
  const style = getTextStyles(item.textFormat, "left");

  return (
    <div data-question-editor data-board-scroll className="h-full touch-pan-y overflow-auto rounded-lg border border-stone-200 bg-white text-stone-900">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 py-1">
        <span className="truncate text-xs font-semibold">{trueFalse ? "True or false" : "Multiple choice"}</span>
        <button type="button" className="min-h-8 rounded-md px-2 text-xs font-medium text-blue-700 hover:bg-blue-50" onClick={stopEditing}>Done</button>
      </div>
      <div className="grid gap-3 p-3">
        <label className="grid gap-1 text-xs font-medium">
          Question
          <textarea rows={2} className={inputClass} style={style} value={item.prompt}
            onChange={(event) => updateQuestion(item.id, { prompt: event.currentTarget.value })} />
        </label>
        <fieldset className="min-w-0 space-y-2">
          <legend className="mb-2 text-xs font-medium">Options</legend>
          {item.options.map((option, index) => (
            <div key={option.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-1.5">
              {trueFalse ? <span className="p-2 text-sm">{option.text}</span> : <textarea aria-label={`Option ${index + 1}`} placeholder={`Option ${index + 1}`} rows={1}
                className={inputClass} style={style} value={option.text}
                onChange={(event) => updateOption(item.id, option.id, { text: event.currentTarget.value })} />}
              <div className="flex items-center">
                <label className="flex min-h-8 items-center gap-1 px-1 text-xs">
                  <input type={trueFalse ? "radio" : "checkbox"} name={trueFalse ? answerGroup : undefined} aria-label={`${trueFalse ? option.text : `Option ${index + 1}`} is correct`} checked={option.correct ?? false}
                    className="h-4 w-4 accent-emerald-700"
                    onChange={(event) => updateOption(item.id, option.id, { correct: event.currentTarget.checked })} />
                  Correct
                </label>
                {!trueFalse && <button type="button" aria-label={`Remove option ${index + 1}`} disabled={item.options.length <= 2}
                  className="grid h-8 w-8 place-items-center rounded-md text-stone-500 hover:bg-stone-100 disabled:opacity-35"
                  onClick={() => removeOption(item.id, option.id)}><FaTimes aria-hidden="true" /></button>}
              </div>
            </div>
          ))}
        </fieldset>
      </div>
      {!trueFalse && <div className="sticky bottom-0 border-t border-stone-200 bg-white px-3 py-1.5">
        <button type="button" className="min-h-8 rounded-md px-2 text-xs font-medium text-blue-700 hover:bg-blue-50"
          onClick={() => addOption(item.id)}>+ Add option</button>
      </div>}
    </div>
  );
}
