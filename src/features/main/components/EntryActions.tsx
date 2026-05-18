"use client";

import Image from "next/image";
import Link from "next/link";

export const EntryActions = () => {
    return (
    <main className="min-h-screen flex items-center justify-center">

      <div className="relative w-full aspect-square">
        
        <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] z-10 animate-alive [animation-delay:0.1s]">
          <Image
            src="/01.png"
            alt="green"
            fill
            className="drop-shadow-xl object-contain"
            priority
          />
        </div>

        <div className="absolute top-[14%] left-[46%] w-[50%] h-[50%] z-10 animate-alive [animation-delay:0.2s]">
          <Image
            src="/02.png"
            alt="cyan"
            fill
            className="drop-shadow-xl object-contain"
          />
        </div>

        <div className="absolute top-[47%] left-[-5%] w-[50%] h-[50%] z-10 animate-alive [animation-delay:0.1s]">
          <Link href={`/board/` + crypto.randomUUID()} className="relative w-full h-full flex items-center justify-center group">
            <Image
              src="/03.png"
              alt="blue"
              fill
              className="drop-shadow-xl object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="relative z-20 text-white font-bold text-center select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Go as a Teacher
            </span>
          </Link>
        </div>

        <div className="absolute top-[50.5%] left-[35%] w-[50%] h-[50%] z-5 animate-alive [animation-delay:0.01s]">
          <Link href={`/board/` + crypto.randomUUID()} className="relative w-full h-full flex items-center justify-center group">
            <Image
              src="/04.png"
              alt="yellow"
              fill
              className="drop-shadow-xl object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="relative z-20 text-black font-bold text-center select-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
              Go as a Student
            </span>
          </Link>
        </div>
      </div>
    </main>
    );
};