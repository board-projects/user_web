import type { TextFormat } from "./textFormat";
import type { Point } from "./types";

export type ChoiceOption = {
  id: string;
  text: string;
  correct?: boolean;
};

export type MultipleChoiceItem = Point & {
  id: string;
  label: string;
  prompt: string;
  width: number;
  height: number;
  options: ChoiceOption[];
  textFormat?: TextFormat;
  multiple?: boolean;
};

export const QUESTION_MIN_SIZE = { width: 200, height: 160 };

export function createChoiceOption(): ChoiceOption {
  return { id: crypto.randomUUID(), text: "", correct: false };
}

export function createMultipleChoice(position: Point): MultipleChoiceItem {
  return {
    ...position, id: crypto.randomUUID(), label: "", prompt: "",
    width: 320, height: 280, options: [createChoiceOption(), createChoiceOption()],
  };
}

export const allowsMultipleAnswers = (item: MultipleChoiceItem) =>
  item.options.some((option) => option.correct !== undefined)
    ? item.options.filter((option) => option.correct).length > 1 : item.multiple ?? false;
