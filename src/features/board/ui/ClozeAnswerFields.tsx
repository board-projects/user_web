import { TextLink } from "./TextLink";

export function ClozeAnswerFields({ itemId, content, answers, link }: {
  itemId: string;
  content: string;
  answers?: string[];
  link?: string;
}) {
  const parts = content.split(/(\[[^\]]*\]|\{\{[^}]*\}\})/g);
  return parts.map((part, index) => {
    if (index % 2 === 0) return <TextLink key={index} link={link}>{part}</TextLink>;

    const blankIndex = (index - 1) / 2;
    return (
      <input key={index} type="text" aria-label={`Blank ${blankIndex + 1}`}
        data-question-id={itemId} data-cloze-blank data-interactive="true"
        defaultValue={answers?.[blankIndex]}
        className="mx-0.5 inline-block h-[1.45em] w-[clamp(2.5rem,20%,4.5rem)] max-w-full rounded-sm border-b border-blue-500 bg-blue-50 px-1 text-center align-baseline text-stone-900 outline-none focus:ring-2 focus:ring-blue-300" />
    );
  });
}
