import type { ItemProperty } from "./itemProperties";

const fieldClass = "h-9 rounded-md border border-stone-300 bg-white px-2 text-sm text-stone-900";
export const propertyButtonClass = "h-9 shrink-0 rounded-md border border-stone-300 bg-white px-2.5 text-sm font-medium text-stone-900 hover:bg-stone-100";

const textToggle = {
  Bold: { glyph: "B", style: "font-bold" },
  Italic: { glyph: "I", style: "italic" },
  Underline: { glyph: "U", style: "underline" },
} as const;

export function ItemPropertyControl({ field, compact = false }: { field: ItemProperty; compact?: boolean }) {
  const toggle = compact && field.label in textToggle ? textToggle[field.label as keyof typeof textToggle] : undefined;
  const inputClass = compact ? "h-8 rounded-md border border-stone-200 bg-white px-1.5 text-xs text-stone-900" : fieldClass;
  if (field.kind === "action") {
    return <button type="button" className={propertyButtonClass} onClick={field.run}>{field.label}</button>;
  }

  if (field.kind === "toggle") {
    return (
      <button type="button"
        className={toggle ? `grid h-8 w-8 place-items-center rounded-md text-sm text-stone-700 hover:bg-stone-200 aria-pressed:bg-blue-100 aria-pressed:text-blue-800 ${toggle.style}` : `${propertyButtonClass} aria-pressed:bg-blue-100`}
        aria-label={field.label} title={field.label} aria-pressed={field.value} onClick={() => field.change(!field.value)}>
        {toggle?.glyph ?? field.label}
      </button>
    );
  }

  return (
    <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-stone-700">
      <span className={compact ? "sr-only" : undefined}>{field.label}</span>
      {field.kind === "number" ? (
        <input
          key={field.value}
          type="number"
          inputMode="numeric"
          min={field.min}
          max={field.max}
          defaultValue={Math.round(field.value)}
          className={`${fieldClass} w-16 sm:w-20`}
          onBlur={(event) => {
            const input = event.currentTarget;
            const value = input.valueAsNumber;
            if (!Number.isFinite(value)) {
              input.value = String(Math.round(field.value));
              return;
            }
            const next = Math.min(field.max, Math.max(field.min, Math.round(value)));
            if (next !== Math.round(field.value)) field.change(next);
            input.value = String(next);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              event.currentTarget.value = String(Math.round(field.value));
              event.currentTarget.blur();
            }
          }}
        />
      ) : field.kind === "select" ? (
        <select aria-label={field.label} value={field.value} title={compact ? field.label : undefined} className={inputClass} onChange={(event) => field.change(event.target.value)}>
          {field.options.map((option) => (
            <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.kind}
          title={compact ? field.label : undefined}
          placeholder={compact && field.kind === "text" ? field.label : undefined}
          value={field.value}
          maxLength={field.kind === "text" ? field.maxLength ?? 80 : undefined}
          className={field.kind === "color"
            ? `${compact ? "h-8 w-8 border-stone-200" : "h-9 w-10 border-stone-300"} cursor-pointer rounded-md border bg-white p-1`
            : `${inputClass} ${compact ? "w-24 sm:w-32" : "w-28 sm:w-36"}`}
          onChange={(event) => field.change(event.target.value)}
        />
      )}
    </label>
  );
}
