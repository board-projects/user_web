import { QUESTION_TYPES } from "../domain/questions";
import type { ClozeTest } from "../domain/types";
import { getTextStyles } from "../domain/textFormat";
import { ClozeAnswerFields } from "./ClozeAnswerFields";
import { QuestionCard } from "./QuestionCard";

export function ClozeQuestionView({ item, answering = false, answers }: {
  item: Pick<ClozeTest, "id" | "title" | "content" | "textFormat">;
  answering?: boolean;
  answers?: string[];
}) {
  return (
    <QuestionCard label={item.title.trim() || QUESTION_TYPES.cloze_test}>
      <div className="whitespace-pre-wrap break-words leading-relaxed" style={getTextStyles(item.textFormat, "left")}>
        <ClozeAnswerFields itemId={item.id} content={item.content} answers={answers} link={answering ? item.textFormat?.link : undefined} />
      </div>
    </QuestionCard>
  );
}
