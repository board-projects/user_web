import { createMultipleChoice, QUESTION_SIZE, type MultipleChoiceItem, type QuestionFrame } from "./multipleChoice";
import type { Point } from "./types";

export const QUESTION_TYPES = {
  multiple_choice: "Multiple choice",
  cloze_test: "Fill in the blanks",
  matching: "Matching",
  ordering: "Ordering",
  image_spot: "Select on image",
  true_false: "True or false",
  essay: "Essay",
} as const;

export type QuestionType = keyof typeof QUESTION_TYPES;
export type QuestionOption = { id: string; text: string };
export type MatchingPair = { left: QuestionOption; right: QuestionOption };
export type MatchingQuestion = QuestionFrame & {
  kind: "matching";
  pairs?: MatchingPair[];
  left?: QuestionOption[];
  right?: QuestionOption[];
};
export type OrderingQuestion = QuestionFrame & { kind: "ordering"; steps: QuestionOption[] };
export type ImageQuestion = QuestionFrame & {
  kind: "image_spot";
  imageUrl: string;
  imageAlt: string;
  target?: Point & { radius: number };
};
export type EssayQuestion = QuestionFrame & { kind: "essay" };
export type QuestionItem = MultipleChoiceItem | MatchingQuestion | OrderingQuestion | ImageQuestion | EssayQuestion;
export type QuestionPatch = Partial<Omit<QuestionFrame, "id">> & {
  pairs?: MatchingPair[];
  steps?: QuestionOption[];
  imageUrl?: string;
  imageAlt?: string;
  target?: ImageQuestion["target"];
};

export const QUESTION_ENTRY_LIMIT = 50;
export const ESSAY_ANSWER_LIMIT = 10_000;

export const createQuestionOption = (): QuestionOption => ({ id: crypto.randomUUID(), text: "" });
export const createMatchingPair = (): MatchingPair => ({ left: createQuestionOption(), right: createQuestionOption() });

export function isChoiceQuestion(item: QuestionItem): item is MultipleChoiceItem {
  return item.kind === undefined || item.kind === "true_false";
}

export function questionImageUrl(value: string) {
  try {
    const url = new URL(value);
    return value.length <= 2048 && url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function createQuestion(kind: Exclude<QuestionType, "cloze_test">, position: Point): QuestionItem {
  const frame: QuestionFrame = { ...position, id: crypto.randomUUID(), ...QUESTION_SIZE, label: "", prompt: "" };
  switch (kind) {
    case "multiple_choice":
      return createMultipleChoice(position);
    case "true_false":
      return { ...frame, kind, options: [{ id: "true", text: "True", correct: true }, { id: "false", text: "False", correct: false }] };
    case "matching":
      return { ...frame, kind, pairs: [createMatchingPair(), createMatchingPair()] };
    case "ordering":
      return { ...frame, kind, steps: [createQuestionOption(), createQuestionOption()] };
    case "essay":
      return { ...frame, kind };
    case "image_spot":
      return { ...frame, kind, imageUrl: "", imageAlt: "" };
  }
}
