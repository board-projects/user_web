import { shapeDefinitions } from "../domain/shapeDefinitions";
import type { ShapeType } from "../domain/types";

export function ShapeIcon({ type }: { type: ShapeType }) {
  const points = shapeDefinitions[type].points;
  return (
    <svg aria-hidden="true" width="1em" height="1em" viewBox="-8 -8 116 116" fill="none" stroke="currentColor"
      strokeWidth={9} strokeLinejoin="round">
      {points ? <polygon points={points.map(([x, y]) => `${x},${y}`).join(" ")} />
        : type === "circle" ? <circle cx={50} cy={50} r={43} />
          : <rect x={5} y={19} width={90} height={62} rx={5} />}
    </svg>
  );
}
