import { contrastingTextColor, getTextStyles, type TextFormat } from "../domain/textFormat";
import type { Point } from "../domain/types";
import { TextLink } from "./TextLink";

type TextProps = {
  width: number;
  height: number;
  text?: string;
  format?: TextFormat;
  background?: string;
  linksEnabled?: boolean;
};

export function ItemText({ x, y, width, height, text, format, background, linksEnabled }: Point & TextProps) {
  if (!text) return null;

  return (
    <foreignObject x={x} y={y} width={width} height={height} pointerEvents={linksEnabled ? undefined : "none"}>
      <div className="flex h-full items-center overflow-hidden" style={{ color: contrastingTextColor(background) }}>
        <span dir="auto" className="max-h-full w-full overflow-hidden whitespace-pre-wrap break-words px-1 text-xs leading-tight"
          style={getTextStyles(format)}>
          <TextLink link={linksEnabled ? format?.link : undefined}>{text}</TextLink>
        </span>
      </div>
    </foreignObject>
  );
}

export function ShapeText({ width, height, ...props }: TextProps) {
  return <ItemText x={width * 0.15} y={height * 0.25} width={width * 0.7} height={height * 0.5} {...props} />;
}
