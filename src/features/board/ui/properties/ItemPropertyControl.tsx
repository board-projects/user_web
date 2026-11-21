import type { ItemProperty } from "./itemProperties";

const fieldClass = "h-9 rounded-md border border-stone-300 bg-white px-2 text-sm text-stone-900";
export const propertyButtonClass = "h-9 shrink-0 rounded-md border border-stone-300 bg-white px-2.5 text-sm font-medium text-stone-900 hover:bg-stone-100";

export function ItemPropertyControl({ field }: { field: ItemProperty }) {
  if (field.kind === "action") {
    return <button type="button" className={propertyButtonClass} onClick={field.run}>{field.label}</button>;
  }

  if (field.kind === "toggle") {
    return (
      <button type="button" className={`${propertyButtonClass} aria-pressed:bg-blue-100`} aria-pressed={field.value} onClick={() => field.change(!field.value)}>
        {field.label}
      </button>
    );
  }

  return (
    <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-stone-700">
      {field.label}
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
      ) : (
        <input
          type={field.kind}
          value={field.value}
          maxLength={field.kind === "text" ? 80 : undefined}
          className={field.kind === "color" ? "h-9 w-10 cursor-pointer rounded border border-stone-300 bg-white p-1" : `${fieldClass} w-28 sm:w-36`}
          onChange={(event) => field.change(event.target.value)}
        />
      )}
    </label>
  );
}
