"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const EntryActions = () => {
  const [teacherId, setTeacherId] = useState("");
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    setTeacherId(crypto.randomUUID());
    setStudentId(crypto.randomUUID());
  }, []);

  return (
    <div className="mx-auto mt-6 w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] aspect-square relative select-none">
      
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

      <div className="absolute top-[47%] left-[-5%] w-[50%] h-[50%] z-20 animate-alive [animation-delay:0.4s]">
        <Link href={`/board/${teacherId}`} className="relative w-full h-full flex items-center justify-center group cursor-pointer">
          <Image
            src="/03.png"
            alt="blue"
            fill
            className="drop-shadow-xl object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="relative z-30 text-white font-bold text-center px-2 text-[11px] sm:text-xs md:text-sm pointer-events-none">
            Go as a Teacher
          </span>
        </Link>
      </div>

      <div className="absolute top-[50.5%] left-[35%] w-[50%] h-[50%] z-10 animate-alive [animation-delay:0.6s]">
        <Link href={`/board/${studentId}`} className="relative w-full h-full flex items-center justify-center group cursor-pointer">
          <Image
            src="/04.png"
            alt="yellow"
            fill
            className="drop-shadow-xl object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="relative z-30 text-black font-bold text-center px-2 text-[11px] sm:text-xs md:text-sm pointer-events-none">
            Go as a Student
          </span>
        </Link>
      </div>

    </div>
  );
};