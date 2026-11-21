export type SheetLayout = { width: number; height: number; dots: boolean };
export type { PageUnit as RulerUnit } from "@/features/board/domain/types";
import type { PageUnit as RulerUnit } from "@/features/board/domain/types";

export const SHEET_PRESETS = [
  { title: "Phone", width: 360, height: 800 },
  { title: "Phone", width: 390, height: 844 },
  { title: "Tablet", width: 768, height: 1024 },
  { title: "Tablet landscape", width: 1024, height: 768 },
  { title: "Desktop", width: 1440, height: 900 },
] as const;

export const DEFAULT_SHEET: SheetLayout = { width: 390, height: 844, dots: false };
export const SHEET_LIMITS = { min: 240, max: 4096 };
const PX_PER_UNIT: Record<RulerUnit, number> = { px: 1, mm: 96 / 25.4, cm: 96 / 2.54, in: 96 };

export function rulerTicks(length: number, scale: number, unit: RulerUnit) {
  const px = PX_PER_UNIT[unit];
  const minimum = 52 / (scale * px);
  const power = 10 ** Math.floor(Math.log10(minimum));
  const major = ([1, 2, 5, 10].find((n) => n * power >= minimum) ?? 10) * power;
  const step = major / 5;
  const count = Math.floor(length / (step * px));
  return Array.from({ length: count + 1 }, (_, index) => ({
    position: index * step * px * scale,
    label: index % 5 === 0 ? String(Number((index * step).toPrecision(6))) : undefined,
  }));
}

