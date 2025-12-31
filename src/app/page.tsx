"use client";
import { useEffect, useState } from "react";

const frames = [
    // FRAME 1 – آماده‌باش
    [
        "........ssss........",
        "......sskkkkss......",
        ".....skkkkkkkks.....",
        ".....sskkkrrkkss.....",
        ".......rrr........",
        ".....wwwwrrwwww.....",
        ".......rrr.........",
        "......ww..ww........",
        ".....ww....ww.......",
    ],

    // FRAME 2 – چرخش بدن
    [
        "........ssss........",
        "....sssskkkkss......",
        "....skkkkkkkks.....",
        ".....sskkkrrkkss.....",
        ".......rrr........",
        "....wwwwrrwwww......",
        ".......rrr.........",
        "....ww..ww..........",
        "...ww....ww.........",
    ],

    // FRAME 3 – ضربه نهایی
    [
        "........ssss........",
        "........kkkksssss...",
        ".....skkkkkkkks....",
        ".....sskkkrrkkss.....",
        ".......rrr........",
        ".....wwwwrrwwww.....",
        ".......rrr.........",
        "......ww..ww........",
        ".....ww....ww.......",
    ],
];

const colorMap: Record<string, string> = {
    s: "#f2c9ac", // skin
    k: "#d97706", // robe
    r: "#92400e", // shadow robe
    w: "#78350f", // staff
    ".": ""
};

export default function Home() {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const i = setInterval(() => {
            setFrame(f => (f + 1) % frames.length);
        }, 180); // انیمه‌طور، نه خیلی سریع

        return () => clearInterval(i);
    }, []);

    return (
        <main className="scene">
            <div
                className="sprite"
                style={{
                    gridTemplateColumns: `repeat(${frames[0][0].length}, 6px)`
                }}
            >
                {frames[frame].map((row, y) =>
                    row.split("").map((c, x) => (
                        <div
                            key={`${x}-${y}`}
                            className="px"
                            style={{ background: colorMap[c] }}
                        />
                    ))
                )}
            </div>
        </main>
    );
}