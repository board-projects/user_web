import { contrastingTextColor, getTextStyles, type TextFormat } from "../domain/textFormat";
import { textParagraphs, type TextRun } from "../domain/richText";
import type { Point } from "../domain/types";
import { TextLink } from "./TextLink";

type TextProps = {
  width: number;
  height: number;
  text?: string;
  runs?: TextRun[];
  format?: TextFormat;
  background?: string;
  linksEnabled?: boolean;
};

export function ItemText({ x, y, width, height, text, runs, format, background, linksEnabled }: Point & TextProps) {
  if (!text) return null;

  return (
    <foreignObject x={x} y={y} width={width} height={height} pointerEvents={linksEnabled ? undefined : "none"}>
      <div className="flex h-full items-center overflow-hidden" style={{ color: contrastingTextColor(background) }}>
        <div className="max-h-full w-full overflow-hidden whitespace-pre-wrap break-words px-1 text-xs leading-tight">
          {textParagraphs(text, runs ?? [], format).map(({ start, align, segments }) => (
            <div key={start} dir="auto" style={{ textAlign: align }}>
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
  return <ItemText x={width * 0.15} y={height * 0.25} width={width * 0.7} height={height * 0.5} {...props} />;
}
