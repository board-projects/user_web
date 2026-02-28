"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaCode, FaRegCircle } from "react-icons/fa";
import {
  TbRectangle,
  TbUsers,
  TbCopy,
  TbLock,
  TbLockOpen,
  TbShape,
  TbPencil,
} from "react-icons/tb";
import { useBoardStore } from "@/features/board/store/board.store";

type PresenceUser = {
  id: string;
  name: string;
  color?: string;
  avatarUrl?: string;
};

type Tool = "pen" | "rect" | "circle" | "code";

type ToolbarProps = {
  onAddCode?: () => void;
  onAddRect?: () => void;
  onAddCircle?: () => void;

  shareUrl?: string;
  onCopyLink?: () => void;
  onToggleLock?: () => void;
  isLocked?: boolean;
  presence?: PresenceUser[];
  viewerCount?: number;

  className?: string;
};

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function useOnClickOutside<T extends HTMLElement>(
  refs: Array<React.RefObject<T | null>>,
  handler: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const inside = refs.some((r) => r.current?.contains(target));
      if (!inside) handler();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [refs, handler, enabled]);
}

function IconButton(props: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={props.title}
      disabled={props.disabled}
      onClick={props.onClick}
      data-ui="true"
      className={cn(
        "grid place-items-center h-10 w-10 rounded-xl",
        "border border-stone-200/80 bg-white/70 backdrop-blur",
        "shadow-[0_1px_0_rgba(0,0,0,0.04)]",
        "transition active:scale-[0.98]",
        "hover:bg-white hover:border-stone-300",
        "focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 focus:ring-offset-stone-100",
        props.active && "bg-stone-900 text-white border-stone-900 hover:bg-stone-900",
        props.disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span className="text-[18px]">{props.children}</span>
    </button>
  );
}

function PresenceMini({ users = [], viewerCount }: { users?: PresenceUser[]; viewerCount?: number }) {
  const shown = users.slice(0, 2);
  const extra = Math.max(0, users.length - shown.length);

  return (
    <div className="flex flex-col items-center gap-1" data-ui="true">
      <div className="flex -space-x-2">
        {shown.map((u) => (
          <div
            key={u.id}
            title={u.name}
            className="h-7 w-7 rounded-full ring-2 ring-stone-100 bg-white overflow-hidden grid place-items-center border border-stone-200"
            style={{ boxShadow: `0 0 0 2px ${u.color ?? "rgba(0,0,0,0.05)"}` }}
          >
            {u.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-stone-700">
                {u.name.trim().slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        ))}
        {extra > 0 && (
          <div className="h-7 w-7 rounded-full ring-2 ring-stone-100 bg-stone-900 text-white grid place-items-center border border-stone-900 text-[10px] font-semibold">
            +{extra}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 text-[10px] text-stone-600">
        <TbUsers className="text-sm" />
        <span>{viewerCount ?? users.length}</span>
      </div>
    </div>
  );
}

export function Toolbar(props: ToolbarProps) {
  const tool = useBoardStore((s) => (s as any).tool as Tool | undefined) ?? "pen";
  const setTool = useBoardStore((s) => (s as any).setTool as ((t: Tool) => void) | undefined);

  const penColor = useBoardStore((s) => s.penColor);
  const setPenColor = useBoardStore((s) => (s as any).setPenColor as ((c: string) => void) | undefined);

  const penSize = useBoardStore((s) => s.penSize);
  const setPenSize = useBoardStore((s) => (s as any).setPenSize as ((n: number) => void) | undefined);

  const [shapesOpen, setShapesOpen] = useState(false);
  const shapesBtnRef = useRef<HTMLDivElement | null>(null);
  const shapesPanelRef = useRef<HTMLDivElement | null>(null);

  // ✅ پنل تنظیمات قلم
  const [penOpen, setPenOpen] = useState(false);
  const penBtnRef = useRef<HTMLDivElement | null>(null);
  const penPanelRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside([shapesBtnRef, shapesPanelRef], () => setShapesOpen(false), shapesOpen);
  useOnClickOutside([penBtnRef, penPanelRef], () => setPenOpen(false), penOpen);

  const copy = async () => {
    if (props.onCopyLink) return props.onCopyLink();
    if (!props.shareUrl) return;
    try {
      await navigator.clipboard.writeText(props.shareUrl);
    } catch {
      // ignore
    }
  };

  const setToolSafe = (t: Tool) => setTool?.(t);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  return (
    <div className={cn("z-50 absolute left-3 top-1/2 -translate-y-1/2", props.className)} data-ui="true">
      <div
        className={cn(
          "rounded-2xl border border-stone-200/80 bg-stone-100/60 backdrop-blur",
          "shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
        )}
      >
        <div className="p-2 flex flex-col items-center gap-2">
          {/* ✅ Pen group (toggle + panel) */}
          <div ref={penBtnRef} className="relative" data-ui="true">
            <IconButton
              title="Pen settings"
              onClick={() => setPenOpen((v) => !v)}
            >
              <TbPencil />
            </IconButton>

            {penOpen && (
              <div
                ref={penPanelRef}
                data-ui="true"
                className={cn(
                  "absolute left-[48px] top-0",
                  "w-44 p-3 rounded-2xl",
                  "border border-stone-200/80 bg-stone-100/70 backdrop-blur",
                  "shadow-[0_10px_30px_rgba(0,0,0,0.10)]",
                  "flex flex-col gap-3"
                )}
              >
                {/* Color */}
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-stone-700">Color</div>
                  <input
                    aria-label="Pen color"
                    type="color"
                    value={penColor}
                    onChange={(e) => setPenColor?.(e.target.value)}
                    data-ui="true"
                      className="cursor-pointer rounded-full"
                    title="Color"
                  />
                </div>

                {/* Size slider 1..256 */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-stone-700">Size</div>
                    <div className="text-xs tabular-nums text-stone-700">{clamp(penSize ?? 1, 1, 256)}</div>
                  </div>

                  <input
                    aria-label="Pen size"
                    type="range"
                    min={1}
                    max={256}
                    value={clamp(penSize ?? 1, 1, 256)}
                    onChange={(e) => setPenSize?.(clamp(Number(e.target.value), 1, 256))}
                    className="w-full"
                    data-ui="true"
                  />

                  {/* optional quick input */}
                  <input
                    aria-label="Pen size number"
                    className="w-full h-9 text-xs text-center rounded-xl border border-stone-200/80 bg-white/70 outline-none"
                    min={1}
                    max={256}
                    value={clamp(penSize ?? 1, 1, 256)}
                    type="number"
                    onChange={(e) => setPenSize?.(clamp(Number(e.target.value), 1, 256))}
                    data-ui="true"
                    title="Size"
                  />
                </div>

                <button
                  type="button"
                  className="w-full h-9 rounded-xl border border-stone-200/80 bg-white/70 text-xs font-semibold text-stone-700 hover:bg-white"
                  onClick={() => {
                    setToolSafe("pen");
                    setPenOpen(false);
                  }}
                >
                  Use pen
                </button>
              </div>
            )}
          </div>

          {/* Code */}
          <IconButton
            title="Add code"
            active={tool === "code"}
            onClick={() => {
              setToolSafe("code");
              props.onAddCode?.();
            }}
          >
            <FaCode />
          </IconButton>

          {/* Shapes group */}
          <div ref={shapesBtnRef} className="relative" data-ui="true">
            <IconButton
              title="Shapes"
              active={tool === "rect" || tool === "circle"}
              onClick={() => setShapesOpen((v) => !v)}
            >
              <TbShape />
            </IconButton>

            {(tool === "rect" || tool === "circle") && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-stone-900 ring-2 ring-stone-100" />
            )}

            {shapesOpen && (
              <div
                ref={shapesPanelRef}
                data-ui="true"
                className={cn(
                  "absolute left-[48px] top-0",
                  "w-12 p-2 rounded-2xl",
                  "border border-stone-200/80 bg-stone-100/70 backdrop-blur",
                  "shadow-[0_10px_30px_rgba(0,0,0,0.10)]",
                  "flex flex-col items-center gap-2"
                )}
              >
                <IconButton
                  title="Rectangle"
                  active={tool === "rect"}
                  onClick={() => {
                    setToolSafe("rect");
                    props.onAddRect?.();
                    setShapesOpen(false);
                  }}
                >
                  <TbRectangle />
                </IconButton>

                <IconButton
                  title="Circle"
                  active={tool === "circle"}
                  onClick={() => {
                    setToolSafe("circle");
                    props.onAddCircle?.();
                    setShapesOpen(false);
                  }}
                >
                  <FaRegCircle />
                </IconButton>
              </div>
            )}
          </div>

          {/* Presence */}
          {(props.presence?.length || props.viewerCount != null) && (
            <div className="pt-2 border-t border-stone-200/80">
              <PresenceMini users={props.presence} viewerCount={props.viewerCount} />
            </div>
          )}

          {/* Share */}
          {(props.shareUrl || props.onCopyLink || props.onToggleLock) && (
            <div className="pt-2 border-t border-stone-200/80 flex flex-col items-center gap-2">
              <IconButton title="Copy share link" onClick={copy} disabled={!props.shareUrl && !props.onCopyLink}>
                <TbCopy />
              </IconButton>

              {props.onToggleLock && (
                <IconButton
                  title={props.isLocked ? "Unlock board" : "Lock board"}
                  onClick={props.onToggleLock}
                  active={!!props.isLocked}
                >
                  {props.isLocked ? <TbLock /> : <TbLockOpen />}
                </IconButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}