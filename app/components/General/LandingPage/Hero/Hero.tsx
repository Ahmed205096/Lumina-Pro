"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { BsStars } from "react-icons/bs";
import { LuX } from "react-icons/lu";

export default function Hero() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const sessionResult = useSession();

  return (
    <>
      <div className="mt-[50px] z-10 px-[20px] md:px-[80px] w-full h-full">
        <div className="w-full h-[40px] shadow-[0_180px_500px_1px_rgba(139,92,246,0.9)]" />
        <div className="mt-[40px] w-full flex justify-center">
          <p className="flex text-[14px] uppercase items-center gap-1 border bg-[#C0C1FF]/5 border-white/10 py-[5px] px-[16px] rounded-4xl">
            <BsStars /> Lumina Obsidian Release
          </p>
        </div>
        <div className="flex flex-col justify-center w-full items-center">
          <h3 className="text-center md:max-w-[800px] max-w-[350px] text-[30px] md:text-[45px] font-bold mt-[20px]">
            Manage Your Team&apos;s Tasks in{" "}
            <span className="text-[#a6a7f6]">One Beautiful Place</span>
          </h3>
          <p className="text-center text-white/70 text-[14px] md:text-lg mt-4 md:max-w-[700px] max-w-[450px] mx-auto">
            The high-performance workspace for teams who value clarity.
            Experience deep focus with our glassmorphic interface and
            hyper-efficient task tracking.
          </p>

          <div className="z-20 mt-[30px] w-full md:w-auto  gap-4 flex md:flex-row flex-col justify-center items-center">
            <Link
              className="w-[70%] "
              href={
                sessionResult?.status === "authenticated"
                  ? "/settings"
                  : "/login"
              }
            >
              {" "}
              <button className="cursor-pointer hover:bg-[#afb0f2] duration-500 bg-[#c4c5ef] text-[18px] max-sm:text-[15px] font-bold text-[#0b0ead] w-full md:w-[250px] py-[15px] rounded-xl">
                Get Started for Free
              </button>
            </Link>
            <button
              onClick={() => setIsDemoOpen(true)}
              className="cursor-pointer max-sm:text-[15px] text-[18px] font-bold hover:bg-white/10 duration-500 text-white border border-white/20 w-[70%] md:w-[200px] py-[15px] rounded-xl"
            >
              View Demo
            </button>
          </div>
        </div>
      </div>

      {isDemoOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-[18px] backdrop-blur-md">
          <button
            aria-label="Close demo video"
            onClick={() => setIsDemoOpen(false)}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 w-full max-w-[900px] overflow-hidden rounded-[22px] border border-white/10 bg-[#13131b] shadow-[0_0_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-[18px] py-[14px]">
              <p className="font-bold">Lumina Demo</p>
              <button
                aria-label="Close demo video"
                onClick={() => setIsDemoOpen(false)}
                className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10"
              >
                <LuX size={20} />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/NpEaa2P7qZI?autoplay=1"
                title="Lumina demo video"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
