import { contrastingTextColor, getTextStyles, type TextFormat } from "../domain/textFormat";
import { textParagraphs, type TextRun } from "../domain/richText";
import { circleTextFloats, shapeTextClip } from "./shapeTextLayout";
import type { Point, ShapeType } from "../domain/types";
import { TextLink } from "./TextLink";

type TextProps = {
  width: number;
  height: number;
  text?: string;
  runs?: TextRun[];
  format?: TextFormat;
  background?: string;
  linksEnabled?: boolean;
  shape?: ShapeType;
};

export function ItemText({ x, y, width, height, text, runs, format, background, linksEnabled, shape }: Point & TextProps) {
  if (!text) return null;

  return (
    <foreignObject x={x} y={y} width={width} height={height} pointerEvents="none">
      <div className={shape ? "h-full overflow-hidden" : "flex h-full items-center overflow-hidden"} style={{ color: contrastingTextColor(background), clipPath: shapeTextClip(shape) }}>
        <div className={`max-h-full w-full overflow-hidden break-words px-1 text-xs leading-tight ${shape ? "h-full py-1" : "whitespace-pre-wrap"}`}>
          {shape === "circle" && circleTextFloats.map((style) => <span key={style.float} aria-hidden="true" style={style} />)}
          {textParagraphs(text, runs ?? [], format).map(({ start, align, segments }) => (
            <div key={start} dir="auto" style={{ textAlign: align, whiteSpace: "pre-wrap" }}>
              {segments.length ? segments.map((segment) => (
                <span key={segment.start} style={getTextStyles(segment.format)}>
                  <TextLink link={linksEnabled ? segment.format.link : undefined}>{segment.text}</TextLink>
                </span>
              )) : <br />}
            </div>
          ))}
        </div>
      </div>
    </foreignObject>
  );
}

export function ShapeText({ width, height, ...props }: TextProps) {
  return <ItemText x={0} y={0} width={width} height={height} {...props} />;
}
