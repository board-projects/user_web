import { SHEET_LIMITS, SHEET_PRESETS, type RulerUnit, type SheetLayout } from "../domain/sheetLayout";

const field = "h-10 rounded-lg border border-cyan-200 bg-white px-2 text-sm text-cyan-950";
export const designButton = "inline-flex min-h-10 items-center justify-center rounded-lg border border-cyan-200 bg-white px-3 text-sm font-semibold text-cyan-900 hover:bg-cyan-100 disabled:opacity-50";

export function DesignControls({ layout, unit, onLayout, onUnit }: {
  layout: SheetLayout; unit: RulerUnit;
  onLayout: (layout: SheetLayout) => void; onUnit: (unit: RulerUnit) => void;
}) {
  const resolution = `${layout.width}x${layout.height}`;
  const preset = SHEET_PRESETS.some(({ width, height }) => `${width}x${height}` === resolution) ? resolution : "custom";
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-xs font-semibold text-cyan-900">
        Resolution
        <select className={field} value={preset} onChange={(event) => {
          const match = SHEET_PRESETS.find(({ width, height }) => `${width}x${height}` === event.target.value);
          if (match) onLayout({ ...layout, width: match.width, height: match.height });
        }}>
          <option value="custom" disabled>Custom size</option>
          {SHEET_PRESETS.map(({ title, width, height }) => (
            <option key={`${width}x${height}`} value={`${width}x${height}`}>{title} · {width} × {height}</option>
          ))}
        </select>
      </label>
      {(["width", "height"] as const).map((dimension) => (
        <label key={dimension} className="grid gap-1 text-xs font-semibold capitalize text-cyan-900">
          {dimension} (px)
          <input
            key={layout[dimension]}
            type="number"
            inputMode="numeric"
            min={SHEET_LIMITS.min}
            max={SHEET_LIMITS.max}
            defaultValue={layout[dimension]}
            className={`${field} w-24`}
            onBlur={(event) => {
              const number = event.currentTarget.valueAsNumber;
              const next = Number.isFinite(number)
                ? Math.min(SHEET_LIMITS.max, Math.max(SHEET_LIMITS.min, Math.round(number)))
                : layout[dimension];
              event.currentTarget.value = String(next);
              if (next !== layout[dimension]) onLayout({ ...layout, [dimension]: next });
            }}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
          />
        </label>
      ))}
      <label className="grid gap-1 text-xs font-semibold text-cyan-900">
        Ruler unit
        <select className={field} value={unit} onChange={(event) => onUnit(event.target.value as RulerUnit)}>
          <option value="px">Pixels (px)</option>
          <option value="mm">Millimeters (mm)</option>
          <option value="cm">Centimeters (cm)</option>
          <option value="in">Inches (in)</option>
        </select>
      </label>
      <button type="button" aria-pressed={layout.dots}
        className={`${designButton} aria-pressed:bg-cyan-200`}
        onClick={() => onLayout({ ...layout, dots: !layout.dots })}>
        Dot grid
      </button>
    </div>
  );
}
