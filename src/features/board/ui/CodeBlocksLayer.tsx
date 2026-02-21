"use client";

import React from "react";
import { Rnd } from "react-rnd";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useBoardStore } from "../store/board.store";

export function CodeBlocksLayer() {
  const codeBlocks = useBoardStore((s) => s.codeBlocks);
  const updateCodeBlock = useBoardStore((s) => s.updateCodeBlock);
  const zoom = useBoardStore((s) => s.zoom);

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {codeBlocks.map((block) => (
        <Rnd
          key={block.id}
          data-interactive="true"
          scale={zoom} // ✅ این هم برای پرش
          size={{ width: block.width, height: block.height }}
          position={{ x: block.x, y: block.y }}
          minWidth={200}
          minHeight={100}
          onDragStop={(_, d) => updateCodeBlock(block.id, { x: d.x, y: d.y })}
          onResizeStop={(_, __, ref, ___, position) =>
            updateCodeBlock(block.id, {
              x: position.x,
              y: position.y,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            })
          }
          // ✅ bounds رو برداشتم تا محدود نشه
          // bounds="parent"
          className="pointer-events-auto"
        >
          <div className="w-full h-full">
            <CodeMirror
              value={block.code}
              className="text-left w-full h-full"
              height="100%"
              width="100%"
              extensions={[javascript()]}
              onChange={(value) => updateCodeBlock(block.id, { code: value })}
              theme="dark"
            />
          </div>
        </Rnd>
      ))}
    </div>
  );
}