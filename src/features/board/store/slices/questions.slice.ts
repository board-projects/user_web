import type { StateCreator } from "zustand";
import { createChoiceOption, type ChoiceOption, type MultipleChoiceItem } from "../../domain/multipleChoice";
import type { BoardState } from "../board.store";

export type QuestionsSlice = {
  questions: MultipleChoiceItem[];
  addQuestion: (item: MultipleChoiceItem) => void;
  updateQuestion: (id: string, patch: Partial<Pick<MultipleChoiceItem, "label" | "prompt" | "x" | "y" | "width" | "height" | "textFormat">>) => void;
  addQuestionOption: (id: string) => void;
  updateQuestionOption: (id: string, optionId: string, patch: Partial<Pick<ChoiceOption, "text" | "correct">>) => void;
  removeQuestionOption: (id: string, optionId: string) => void;
};

export const createQuestionsSlice: StateCreator<BoardState, [], [], QuestionsSlice> = (set) => {
  const update = (id: string, change: (item: MultipleChoiceItem) => MultipleChoiceItem) =>
    set((state) => ({ questions: state.questions.map((item) => item.id === id ? change(item) : item) }));

  return {
    questions: [],
    addQuestion: (item) => set((state) => ({ questions: [...state.questions, item] })),
    updateQuestion: (id, patch) => update(id, (item) => ({ ...item, ...patch })),
    addQuestionOption: (id) => update(id, (item) => ({ ...item, options: [...item.options, createChoiceOption()] })),
    updateQuestionOption: (id, optionId, patch) => update(id, (item) => ({
      ...item, options: item.options.map((option) => option.id === optionId ? { ...option, ...patch } : option),
    })),
    removeQuestionOption: (id, optionId) => update(id, (item) => item.options.length <= 2
      ? item : { ...item, options: item.options.filter((option) => option.id !== optionId) }),
  };
};
