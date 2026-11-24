"use client";

import { useState } from "react";
import { isChoiceQuestion, QUESTION_TYPES, type MatchingQuestion, type OrderingQuestion, type QuestionItem } from "../domain/questions";
import { getTextStyles } from "../domain/textFormat";
import type { Point } from "../domain/types";
import { MultipleChoiceView } from "./MultipleChoiceView";
import { QuestionImagePicker } from "./QuestionImagePicker";
import { QuestionCard } from "./QuestionCard";
import { TextLink } from "./TextLink";

function AnswerValue({ id, value }: { id: string; value: string }) {
  return <input type="hidden" data-question-answer data-question-id={id} value={value} />;
}

function MatchAnswers({ item, selection }: { item: MatchingQuestion; selection: string[] }) {
  const left = item.left ?? item.pairs?.map((pair) => pair.left) ?? [];
  const right = item.right ?? item.pairs?.map((pair) => pair.right) ?? [];
  const [matches, setMatches] = useState<Record<string, string>>(() => Object.fromEntries(selection.map((value) => value.split(":"))));

  return (
    <div className="grid min-w-0 gap-2">
      {left.map((option, index) => (
        <label key={option.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-2">
          <span className="break-words">{option.text || `Prompt ${index + 1}`}</span>
          <select className="min-h-9 min-w-0 rounded-md border border-stone-300 bg-white px-1"
            value={matches[option.id] ?? ""} onChange={(event) => {
              const value = event.currentTarget.value;
              setMatches((previous) => ({ ...previous, [option.id]: value }));
            }}>
            <option value="">Choose a match</option>
            {right.map((choice, index) => (
              <option key={choice.id} value={choice.id}
                disabled={Object.entries(matches).some(([id, value]) => id !== option.id && value === choice.id)}>
                {choice.text || `Match ${index + 1}`}
              </option>
            ))}
          </select>
          {matches[option.id] && <AnswerValue id={item.id} value={`${option.id}:${matches[option.id]}`} />}
        </label>
      ))}
    </div>
  );
}

function OrderAnswers({ item, selection }: { item: OrderingQuestion; selection: string[] }) {
  const [order, setOrder] = useState(() => selection.length === item.steps.length
    ? selection : item.steps.map(({ id }) => id));
  const steps = new Map(item.steps.map((step) => [step.id, step]));
  const move = (index: number, offset: number) => {
    setOrder((previous) => {
      const next = [...previous];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  };

  return (
    <ol className="grid gap-1.5">
      {order.map((id, index) => (
        <li key={id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1 rounded-md border border-stone-200 px-2">
          <span className="break-words">{index + 1}. {steps.get(id)?.text || "Step"}</span>
          {([-1, 1] as const).map((offset) => (
            <button key={offset} type="button" disabled={index + offset < 0 || index + offset >= order.length}
              onClick={() => move(index, offset)} aria-label={`Move item ${index + 1} ${offset < 0 ? "up" : "down"}`}
              className="h-9 w-8 rounded-md font-semibold hover:bg-stone-100 disabled:opacity-30">{offset < 0 ? "↑" : "↓"}</button>
          ))}
          <AnswerValue id={item.id} value={id} />
        </li>
      ))}
    </ol>
  );
}

function imageAnswer(value?: string): Point | undefined {
  if (!value) return;
  const [x, y] = value.split(",").map(Number);
  if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
}

export function QuestionView({ item, answering = false, selection = [] }: {
  item: QuestionItem;
  answering?: boolean;
  selection?: string[];
}) {
  const [point, setPoint] = useState(() => imageAnswer(selection[0]));
  if (isChoiceQuestion(item)) return <MultipleChoiceView item={item} answering={answering} selection={selection} />;

  return (
    <QuestionCard label={item.label || QUESTION_TYPES[item.kind]}>
      <div className="mb-2 whitespace-pre-wrap break-words" style={getTextStyles(item.textFormat, "left")}>
        <TextLink link={answering ? item.textFormat?.link : undefined}>{item.prompt.trim() || "Question"}</TextLink>
      </div>
      {item.kind === "matching" && (answering ? <MatchAnswers item={item} selection={selection} /> : (
        <ul className="grid gap-1.5">{item.pairs?.map(({ left, right }) => (
          <li key={left.id} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 rounded-md border border-stone-200 p-2">
            <span className="break-words">{left.text || "Prompt"}</span><span aria-hidden="true">↔</span>
            <span className="break-words">{right.text || "Match"}</span>
          </li>
        ))}</ul>
      ))}
      {item.kind === "ordering" && (answering ? <OrderAnswers item={item} selection={selection} /> : (
        <ol className="grid gap-1.5">{item.steps.map((step, index) => (
          <li key={step.id} className="break-words rounded-md border border-stone-200 p-2">{index + 1}. {step.text || "Step"}</li>
        ))}</ol>
      ))}
      {item.kind === "image_spot" && (
        <>
          <QuestionImagePicker url={item.imageUrl} alt={item.imageAlt} point={answering ? point : item.target}
            radius={answering ? undefined : item.target?.radius} onPick={answering ? setPoint : undefined} />
          {answering && point && <AnswerValue id={item.id} value={`${point.x.toFixed(4)},${point.y.toFixed(4)}`} />}
        </>
      )}
    </QuestionCard>
  );
}
