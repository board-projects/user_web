import type { TextFormat } from "./textFormat";
import type { Point } from "./types";

export type ChoiceOption = {
  id: string;
  text: string;
  correct?: boolean;
};

export type QuestionFrame = Point & {
  id: string;
  label: string;
  prompt: string;
  width: number;
  height: number;
  textFormat?: TextFormat;
};

export type MultipleChoiceItem = QuestionFrame & {
  kind?: "true_false";
  options: ChoiceOption[];
  multiple?: boolean;
};

export const QUESTION_SIZE = { width: 320, height: 280 };

export const QUESTION_MIN_SIZE = { width: 200, height: 160 };

export function createChoiceOption(): ChoiceOption {
  return { id: crypto.randomUUID(), text: "", correct: false };
}

export function createMultipleChoice(position: Point): MultipleChoiceItem {
  return {
    ...position, id: crypto.randomUUID(), label: "", prompt: "",
    ...QUESTION_SIZE, options: [createChoiceOption(), createChoiceOption()],
  };
}

export const allowsMultipleAnswers = (item: MultipleChoiceItem) =>
  item.options.some((option) => option.correct !== undefined)
    ? item.options.filter((option) => option.correct).length > 1 : item.multiple ?? false;
