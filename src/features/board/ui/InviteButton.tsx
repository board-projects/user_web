"use client";

import React from "react";

export function InviteButton(props: { url: string; onCopied?: () => void }) {
    const copy = async () => {
        await navigator.clipboard.writeText(props.url);
        props.onCopied?.();
    };

    return (
        <button
            onClick={copy}
            className="absolute right-0 bg-cyan-500 text-cyan-950 rounded-sm px-4 m-1 cursor-pointer hover:bg-cyan-600 hover:text-cyan-100 transition"
        >
            <strong>Invite</strong>
        </button>
    );
}
