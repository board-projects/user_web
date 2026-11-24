import type { ComponentProps } from "react";
import type { Rnd } from "react-rnd";
import { BoardResizable } from "./BoardResizable";
import { questionConnectable } from "../domain/connectableItems";
import { QUESTION_MIN_SIZE, type MultipleChoiceItem } from "../domain/multipleChoice";
import { selectBoardItem, useBoardItemDrag } from "../hooks/useBoardItemDrag";
import { useBoardStore } from "../store/board.store";
import { selectionKey } from "../store/slices/selection.slice";
import { ConnectionPorts } from "./ConnectionPorts";
import { MultipleChoiceEditor } from "./MultipleChoiceEditor";
import { MultipleChoiceView } from "./MultipleChoiceView";
import { itemResizeHandles, itemSelectionStyle } from "./itemSelection";

function QuestionFrame({ item }: { item: MultipleChoiceItem }) {
  const key = selectionKey("question", item.id);
  const selected = useBoardStore((state) => state.selection?.type === "question" && state.selection.id === item.id);
  const inGroup = useBoardStore((state) => state.marqueeSelection?.items.has(key));
  const editing = useBoardStore((state) => state.editingQuestionId === item.id);
  const canEdit = useBoardStore((state) => state.tool === "select" && !state.panMode);
  const zoom = useBoardStore((state) => state.zoom);
  const update = useBoardStore((state) => state.updateQuestion);
  const startEditing = useBoardStore((state) => state.startEditingQuestion);
  const dragItem = useBoardItemDrag();
  const selection = { type: "question" as const, id: item.id };
  const resize: ComponentProps<typeof Rnd>["onResize"] = (_, __, element, ___, position) =>
    update(item.id, { ...position, width: element.offsetWidth, height: element.offsetHeight });

  return (
    <BoardResizable
      data-interactive="true"
      data-board-selection-key={key}
      data-board-connectable-id={item.id}
      scale={zoom}
      position={item}
      size={item}
      minWidth={QUESTION_MIN_SIZE.width}
      minHeight={QUESTION_MIN_SIZE.height}
      maxWidth={4000}
      maxHeight={4000}
      disableDragging={editing || !canEdit}
      enableResizing={selected && canEdit && !editing ? { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true } : false}
      resizeHandleComponent={itemResizeHandles}
      onResize={resize}
      onResizeStop={resize}
      cancel="[data-connection-handle], [data-question-editor]"
      className="pointer-events-auto"
      {...dragItem(selection, item, (position) => update(item.id, position), true)}
    >
      <div className="h-full rounded-lg" style={itemSelectionStyle(selected || !!inGroup)}
        onClick={() => { if (canEdit && !editing) selectBoardItem(selection); }}
        onDoubleClick={() => {
          if (!canEdit || editing) return;
          useBoardStore.getState().select(selection);
          startEditing(item.id);
        }}>
        {editing ? <MultipleChoiceEditor item={item} /> : <MultipleChoiceView item={item} />}
      </div>
      <ConnectionPorts item={questionConnectable(item)} selected={selected && !editing} />
    </BoardResizable>
  );
}

export function QuestionItemsLayer() {
  const questions = useBoardStore((state) => state.questions);
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {questions.map((item) => <QuestionFrame key={item.id} item={item} />)}
    </div>
  );
}
