"use client";

import React from "react";

export function InviteButton(props: { url: string; onCopied?: () => void }) {
  const copy = async () => {
    await navigator.clipboard.writeText(props.url);
    props.onCopied?.();
  };

  return (
    <button
      data-ui="true"
      onClick={copy}
      className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[100] min-h-10 bg-cyan-500 text-cyan-950 rounded-sm px-4 cursor-pointer hover:bg-cyan-600 hover:text-cyan-100 transition"
    >
      <strong>Invite</strong>
    </button>
  );
}
