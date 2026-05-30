"use client";
import { useSidebarState } from "@/store";
import Image from "next/image";
import { VscBellDot } from "react-icons/vsc";
import { RiSearch2Line } from "react-icons/ri";
import { glassmorphism_base } from "../Sidebar/Sidebar";
import { ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

export default function Searchbar({ children }: IProps) {
  const { isOpen } = useSidebarState();

  return (
    <>
      <div
        className={`
          duration-300 relative min-h-screen flex flex-col
          ${!isOpen 
            ? "absolute w-full md:relative md:flex-1" 
            : "hidden md:block md:flex-1"
          }
        `}
      >
        <div className="flex p-[10px] bg-[#1f1f27] items-center justify-between w-full border-b border-white/10"> 
          <label
            className={`flex ${!isOpen ? "ml-[70px] md:ml-0" : ""} bg-white/4 items-center gap-5 border border-white/20 p-[10px] px-[50px] rounded-4xl`}
            htmlFor="search"
          >
            <div className={`absolute top-0 left-0 w-[200px] h-[60px] opacity-30 ${glassmorphism_base}`} />
            <div className={`absolute bottom-0 right-0 w-[200px] h-[60px] opacity-30 ${glassmorphism_base}`} />
            <RiSearch2Line color="gray" className="ml-[-25px]" />

            <input
              id="search"
              type="text"
              className="outline-none border-none bg-transparent text-white"
              placeholder="Search workspace..."
            />
          </label>
          <div className="flex items-center gap-5">
            <button className="text-white">
              <VscBellDot />
            </button>
            <Image
              src="/globe.svg"
              className=""
              width={25}
              height={25}
              alt="profile"
            />
          </div>
        </div>

        <div className="p-4 flex-1">
          {children}
        </div>

        <footer className="mt-auto w-full border-t border-white/5 bg-[#1f1f27]/40 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Lumina Pro. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-white/80 duration-200">Privacy Policy</a>
            <a href="/terms" className="hover:text-white/80 duration-200">Terms of Service</a>
            <a href="/support" className="hover:text-white/80 duration-200">Support</a>
          </div>
        </footer>

      </div>
    </>
  );
}