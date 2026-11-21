import { useEffect, useRef } from "react";
import type { Point } from "../domain/types";

type Props = {
  point: Point;
  zoom: number;
  label: string;
  editing: boolean;
  interactive: boolean;
  onCancel: () => void;
  onSave: (label: string) => void;
};

export function ConnectionLabel({ point, zoom, label, editing, interactive, onCancel, onSave }: Props) {
  const input = useRef<HTMLInputElement | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!editing) return;
    cancelled.current = false;
    input.current?.focus();
  }, [editing]);

  if (editing) {
    const width = 192 / zoom;
    const height = 34 / zoom;
    return (
      <foreignObject
        x={point.x - width / 2}
        y={point.y - height / 2}
        width={width}
        height={height}
        style={{ pointerEvents: "auto" }}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <input
          ref={input}
          type="text"
          aria-label="Connector label"
          placeholder="Add label"
          maxLength={80}
          defaultValue={label}
          className="h-full w-full rounded border border-blue-400 bg-white px-1 text-center text-stone-900 outline-none"
          style={{ fontSize: 13 / zoom }}
          onBlur={(event) => {
            if (!cancelled.current) onSave(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              cancelled.current = true;
              onCancel();
            }
          }}
        />
      </foreignObject>
    );
  }

  if (!label) return null;

  return (
    <text
      x={point.x}
      y={point.y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13 / zoom}
      fontWeight={600}
      fill="#1c1917"
      stroke="white"
      strokeWidth={5 / zoom}
      strokeLinejoin="round"
      paintOrder="stroke"
      style={{ pointerEvents: interactive ? "all" : "none", cursor: "pointer" }}
    >
      {label}
    </text>
  );
}
