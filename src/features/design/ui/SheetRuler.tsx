import { rulerTicks, type RulerUnit } from "../domain/sheetLayout";

export const RULER_SIZE = 28;

export function SheetRuler({ axis, length, scale, unit }: {
  axis: "horizontal" | "vertical"; length: number; scale: number; unit: RulerUnit;
}) {
  const horizontal = axis === "horizontal";
  return (
    <svg
      width={horizontal ? length * scale : RULER_SIZE}
      height={horizontal ? RULER_SIZE : length * scale}
      aria-hidden="true"
      className="block bg-cyan-50 text-cyan-900"
    >
      {rulerTicks(length, scale, unit).map(({ position, label }, index) => {
        const inset = label === undefined ? 6 : 11;
        return (
          <g key={index} transform={horizontal ? `translate(${position},0)` : `translate(0,${position})`}>
            <line
              x1={horizontal ? 0 : RULER_SIZE - inset}
              y1={horizontal ? RULER_SIZE - inset : 0}
              x2={horizontal ? 0 : RULER_SIZE}
              y2={horizontal ? RULER_SIZE : 0}
              stroke="currentColor"
              opacity={label === undefined ? 0.45 : 0.8}
            />
            {label !== undefined && (
              <text x={horizontal ? 3 : 2} y={11} fontSize={9} fill="currentColor">
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
