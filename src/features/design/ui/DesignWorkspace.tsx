"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BoardEditor } from "@/features/board/ui/BoardEditor";
import { useBoardStore } from "@/features/board/store/board.store";
import { DEFAULT_SHEET, isSheetLayout, type RulerUnit, type SheetLayout } from "../domain/sheetLayout";
import { DesignControls, designButton } from "./DesignControls";
import { DesignPublish } from "./DesignPublish";
import { DesignSheet } from "./DesignSheet";
import { RULER_SIZE, SheetRuler } from "./SheetRuler";

function PrintableDesign({ layout }: { layout: SheetLayout }) {
  const shapes = useBoardStore((state) => state.shapes);
  const codeBlocks = useBoardStore((state) => state.codeBlocks);
  const clozeTests = useBoardStore((state) => state.clozeTests);
  const connections = useBoardStore((state) => state.connections);
  const lines = useBoardStore((state) => state.lines);

  return (
    <div className="hidden print:block" style={{ width: layout.width }}>
      <style>{`@media print { @page { size: ${layout.width}px ${layout.height}px; margin: 0; } }`}</style>
      <DesignSheet title="Test design" layout={layout} board={{ shapes, codeBlocks, clozeTests, connections, lines }} />
    </div>
  );
}

export function DesignWorkspace({ reference }: { reference: string }) {
  const [layout, setLayout] = useState(DEFAULT_SHEET);
  const [unit, setUnit] = useState<RulerUnit>("px");
  const stage = useRef<HTMLDivElement | null>(null);
  const [available, setAvailable] = useState(DEFAULT_SHEET.width + RULER_SIZE);
  const storageKey = `dequizma:sheet:${reference}`;

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (isSheetLayout(saved)) setLayout(saved);
    } catch {
      // A blocked storage policy still allows editing the current sheet.
    }
  }, [storageKey]);

  const changeLayout = (next: SheetLayout) => {
    setLayout(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // The current editor state is available until the page is closed.
    }
  };

  useLayoutEffect(() => {
    const element = stage.current;
    if (!element) return;
    const update = () => setAvailable(element.clientWidth);
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(1, Math.max(0.01, (available - RULER_SIZE) / layout.width));
  const boardUrl = `/board/${encodeURIComponent(reference)}`;

  return (
    <BoardEditor reference={reference} sheet={{ ...layout, scale }} renderDesign={(editor, sync, toolbar) => (
      <>
        <main className="min-h-dvh bg-cyan-50 px-3 py-4 text-cyan-950 print:hidden sm:px-6">
          <div className="mx-auto max-w-screen-2xl">
            <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={boardUrl} className={designButton}>Board</Link>
                <h1 className="text-xl font-extrabold sm:text-3xl">Test designer</h1>
              </div>
              <button type="button" className={designButton} onClick={() => window.print()}>Export PDF</button>
            </header>

            <section className="mb-4 space-y-3 rounded-xl border border-cyan-100 bg-white p-3 sm:p-4">
              <DesignControls layout={layout} unit={unit} onLayout={changeLayout} onUnit={setUnit} />
              <DesignPublish reference={reference} layout={layout} {...sync} />
            </section>

            <div className="relative z-50 mb-3">{toolbar}</div>
            <div ref={stage} className="w-full overflow-x-auto">
              <div className="mx-auto grid w-max grid-cols-[auto_auto] grid-rows-[auto_auto]">
                <span className="grid place-items-center bg-cyan-100 text-[10px] font-semibold text-cyan-900">{unit}</span>
                <SheetRuler axis="horizontal" length={layout.width} scale={scale} unit={unit} />
                <SheetRuler axis="vertical" length={layout.height} scale={scale} unit={unit} />
                <div className="overflow-hidden shadow-sm ring-1 ring-cyan-200">{editor}</div>
              </div>
            </div>
          </div>
        </main>
        <PrintableDesign layout={layout} />
      </>
    )} />
  );
}
