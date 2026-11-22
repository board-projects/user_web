import type { Point } from "../domain/types";

export function ItemText({ x, y, width, height, text }: Point & {
  width: number;
  height: number;
  text?: string;
}) {
  if (!text) return null;

  return (
    <foreignObject x={x} y={y} width={width} height={height} pointerEvents="none">
      <div className="grid h-full place-items-center overflow-hidden">
        <span dir="auto" className="max-h-full max-w-full overflow-hidden whitespace-pre-wrap break-words bg-white/90 px-1 text-center text-xs leading-tight text-stone-900">
          {text}
        </span>
      </div>
    </foreignObject>
  );
}

export function ShapeText({ width, height, text }: { width: number; height: number; text?: string }) {
  return <ItemText x={width * 0.15} y={height * 0.25} width={width * 0.7} height={height * 0.5} text={text} />;
}
