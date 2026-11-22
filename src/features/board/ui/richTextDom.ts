import { textParagraphs, type TextRange, type TextRun } from "../domain/richText";
import { safeTextLink, getTextStyles, type TextFormat } from "../domain/textFormat";

export function readTextSelection(root: HTMLElement): TextRange | null {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;

  const prefix = document.createRange();
  prefix.selectNodeContents(root);
  prefix.setEnd(range.startContainer, range.startOffset);
  const start = prefix.toString().length;
  return { start, end: start + range.toString().length };
}

export function restoreTextSelection(root: HTMLElement, { start, end }: TextRange) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const locate = (offset: number): [Node, number] => {
    walker.currentNode = root;
    let node = walker.nextNode();
    while (node) {
      const length = node.textContent?.length ?? 0;
      if (offset <= length) return [node, offset];
      offset -= length;
      node = walker.nextNode();
    }
    return [root, root.childNodes.length];
  };
  const range = document.createRange();
  range.setStart(...locate(start));
  range.setEnd(...locate(end));
  root.focus();
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export function renderEditableText(root: HTMLElement, text: string, runs: readonly TextRun[], base?: TextFormat) {
  const paragraphs = textParagraphs(text, runs, base);
  root.replaceChildren(...paragraphs.flatMap(({ align, segments }, index) => {
    const line = document.createElement("div");
    line.dir = "auto";
    line.style.textAlign = align;
    line.style.whiteSpace = "pre-wrap";
    for (const segment of segments) {
      const span = document.createElement("span");
      const { fontSize, ...style } = getTextStyles(segment.format);
      Object.assign(span.style, style);
      if (safeTextLink(segment.format.link)) span.style.textDecoration = "underline dotted";
      if (fontSize) span.style.fontSize = `${fontSize}px`;
      span.textContent = segment.text;
      line.append(span);
    }
    if (!segments.length) line.append(document.createElement("br"));
    return index === 0 ? [line] : [document.createTextNode("\n"), line];
  }));
}
