import {
  createMatchingPair, createQuestionOption, QUESTION_ENTRY_LIMIT, QUESTION_TYPES,
  type EssayQuestion, type ImageQuestion, type MatchingQuestion, type OrderingQuestion, type QuestionOption,
} from "../domain/questions";
import { getTextStyles } from "../domain/textFormat";
import { useBoardStore } from "../store/board.store";
import { QuestionEditorCard } from "./QuestionCard";
import { QuestionImagePicker } from "./QuestionImagePicker";

type StructuredQuestion = MatchingQuestion | OrderingQuestion | ImageQuestion | EssayQuestion;
const fieldClass = "min-w-0 rounded-md border border-stone-300 p-2 text-sm focus:border-blue-500";
const actionClass = "min-h-9 rounded-md px-2 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-40";

function EntryInput({ option, label, change }: { option: QuestionOption; label: string; change: (text: string) => void }) {
  return <input className={fieldClass} aria-label={label} placeholder={label} maxLength={2000} value={option.text}
    onChange={(event) => change(event.currentTarget.value)} />;
}

function MatchingEditor({ item }: { item: MatchingQuestion }) {
  const update = useBoardStore((state) => state.updateQuestion);
  const pairs = item.pairs ?? [];
  return (
    <fieldset className="grid min-w-0 gap-2">
      <legend className="mb-2 text-xs">Enter one correct pair per row.</legend>
      {pairs.map((pair, index) => (
        <div key={pair.left.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-1">
          {(["left", "right"] as const).map((side) => (
            <EntryInput key={side} option={pair[side]} label={`${side === "left" ? "Prompt" : "Match"} ${index + 1}`}
              change={(text) => update(item.id, { pairs: pairs.map((entry) => entry === pair
                ? { ...pair, [side]: { ...pair[side], text } } : entry) })} />
          ))}
          <button type="button" className={actionClass} aria-label={`Remove pair ${index + 1}`} disabled={pairs.length <= 2}
            onClick={() => update(item.id, { pairs: pairs.filter((entry) => entry !== pair) })}>×</button>
        </div>
      ))}
      <button type="button" className={actionClass} disabled={pairs.length >= QUESTION_ENTRY_LIMIT}
        onClick={() => update(item.id, { pairs: [...pairs, createMatchingPair()] })}>Add pair</button>
    </fieldset>
  );
}

function OrderingEditor({ item }: { item: OrderingQuestion }) {
  const update = useBoardStore((state) => state.updateQuestion);
  const { steps } = item;
  return (
    <fieldset className="grid min-w-0 gap-2">
      <legend className="mb-2 text-xs">Enter the steps in the correct order.</legend>
      {steps.map((step, index) => (
        <div key={step.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-1">
          <EntryInput option={step} label={`Step ${index + 1}`}
            change={(text) => update(item.id, { steps: steps.map((entry) => entry === step ? { ...step, text } : entry) })} />
          <button type="button" className={actionClass} aria-label={`Remove step ${index + 1}`} disabled={steps.length <= 2}
            onClick={() => update(item.id, { steps: steps.filter((entry) => entry !== step) })}>×</button>
        </div>
      ))}
      <button type="button" className={actionClass} disabled={steps.length >= QUESTION_ENTRY_LIMIT}
        onClick={() => update(item.id, { steps: [...steps, createQuestionOption()] })}>Add step</button>
    </fieldset>
  );
}

function ImageEditor({ item }: { item: ImageQuestion }) {
  const update = useBoardStore((state) => state.updateQuestion);
  return (
    <div className="grid gap-2 text-xs">
      <label className="grid gap-1">Image URL (HTTPS)
        <input type="url" className={fieldClass} maxLength={2048} value={item.imageUrl}
          onChange={(event) => update(item.id, { imageUrl: event.currentTarget.value, target: undefined })} />
      </label>
      <label className="grid gap-1">Image description
        <input className={fieldClass} maxLength={300} value={item.imageAlt}
          onChange={(event) => update(item.id, { imageAlt: event.currentTarget.value })} />
      </label>
      <p>Click the image to mark the correct area.</p>
      <QuestionImagePicker key={item.imageUrl} url={item.imageUrl} alt={item.imageAlt} point={item.target} radius={item.target?.radius}
        onPick={(point) => update(item.id, { target: { ...point, radius: item.target?.radius ?? 0.08 } })} />
      {item.target && <label className="grid gap-1">Target size
        <input type="range" min={0.01} max={0.3} step={0.01} value={item.target.radius}
          onChange={(event) => item.target && update(item.id, { target: { ...item.target, radius: Number(event.currentTarget.value) } })} />
      </label>}
    </div>
  );
}

export function StructuredQuestionEditor({ item }: { item: StructuredQuestion }) {
  const update = useBoardStore((state) => state.updateQuestion);
  const stopEditing = useBoardStore((state) => state.stopEditingQuestion);
  return (
    <QuestionEditorCard title={QUESTION_TYPES[item.kind]} done={stopEditing}>
      <label className="grid gap-1 text-xs">Question
        <textarea rows={2} className={fieldClass} style={getTextStyles(item.textFormat, "left")} value={item.prompt}
          onChange={(event) => update(item.id, { prompt: event.currentTarget.value })} />
      </label>
      {item.kind === "matching" && <MatchingEditor item={item} />}
      {item.kind === "ordering" && <OrderingEditor item={item} />}
      {item.kind === "image_spot" && <ImageEditor item={item} />}
    </QuestionEditorCard>
  );
}
