export const TEXT_ALIGNMENTS = ["left", "center", "right"] as const;

export const TEXT_FONTS = ["Arial", "Georgia", "Verdana", "Courier New"] as const;
export const TEXT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64] as const;

export type TextFormat = {
  font?: (typeof TEXT_FONTS)[number];
  size?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: (typeof TEXT_ALIGNMENTS)[number];
  link?: string;
};

export const validTextColor = (value?: string) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : undefined;

export const getTextStyles = (format?: TextFormat, defaultAlign: TextFormat["align"] = "center") => ({
  color: validTextColor(format?.color),
  fontFamily: TEXT_FONTS.find((font) => font === format?.font),
  fontSize: TEXT_SIZES.find((size) => size === format?.size),
  fontWeight: format?.bold ? 700 : "normal",
  fontStyle: format?.italic ? "italic" : "normal",
  textDecoration: format?.underline ? "underline" : "none",
  textAlign: format?.align ?? defaultAlign,
});

export function safeTextLink(value?: string) {
  if (!value) return undefined;
  try {
    const input = value.trim();
    const bareDomain = /^[\w-]+(?:\.[\w-]+)+(?:[/:?#]|$)/i.test(input);
    const url = new URL(bareDomain ? `https://${input}` : input);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function contrastingTextColor(background?: string) {
  if (!background || !/^#[0-9a-f]{6}$/i.test(background)) return undefined;
  const [red, green, blue] = [1, 3, 5].map((index) => {
    const component = Number.parseInt(background.slice(index, index + 2), 16) / 255;
    return component <= 0.04045 ? component / 12.92 : ((component + 0.055) / 1.055) ** 2.4;
  });
  return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 0.179 ? "#000000" : "#ffffff";
}
