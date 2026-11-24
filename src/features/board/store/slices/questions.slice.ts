import type { StateCreator } from "zustand";
import { createChoiceOption, type ChoiceOption } from "../../domain/multipleChoice";
import { isChoiceQuestion, type QuestionItem, type QuestionPatch } from "../../domain/questions";
import type { BoardState } from "../board.store";

export type QuestionsSlice = {
  questions: QuestionItem[];
  addQuestion: (item: QuestionItem) => void;
  updateQuestion: (id: string, patch: QuestionPatch) => void;
  addQuestionOption: (id: string) => void;
  updateQuestionOption: (id: string, optionId: string, patch: Partial<Pick<ChoiceOption, "text" | "correct">>) => void;
  removeQuestionOption: (id: string, optionId: string) => void;
};

export const createQuestionsSlice: StateCreator<BoardState, [], [], QuestionsSlice> = (set) => {
  const update = (id: string, change: (item: QuestionItem) => QuestionItem) =>
    set((state) => ({ questions: state.questions.map((item) => item.id === id ? change(item) : item) }));

  return {
    questions: [],
    addQuestion: (item) => set((state) => ({ questions: [...state.questions, item] })),
    updateQuestion: (id, patch) => update(id, (item) => ({ ...item, ...patch })),
    addQuestionOption: (id) => update(id, (item) => isChoiceQuestion(item) && !item.kind ? { ...item, options: [...item.options, createChoiceOption()] } : item),
    updateQuestionOption: (id, optionId, patch) => update(id, (item) => {
      if (!isChoiceQuestion(item)) return item;
      const options = item.options.map((option) => {
        if (item.kind === "true_false") return { ...option, correct: option.id === optionId };
        return option.id === optionId ? { ...option, ...patch } : option;
      });
      return { ...item, options };
    }),
    removeQuestionOption: (id, optionId) => update(id, (item) => !isChoiceQuestion(item) || item.kind || item.options.length <= 2
      ? item : { ...item, options: item.options.filter((option) => option.id !== optionId) }),
  };
};
