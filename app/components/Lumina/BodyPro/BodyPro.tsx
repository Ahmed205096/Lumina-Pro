"use client";
import { useSidebarState } from "@/store";
import Image from "next/image";
import { RiSearch2Line } from "react-icons/ri";
import { glassmorphism_base } from "../Sidebar/Sidebar";
import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";

interface IProps {
  children: ReactNode;
}

export default function BodyPro({ children }: IProps) {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const router = useRouter();
  const { isOpen } = useSidebarState();

  return (
    <>
      <div
        className={`
          duration-300 relative h-screen min-h-0 flex flex-col overflow-hidden
          ${
            !isOpen
              ? "absolute w-full md:relative md:flex-1"
              : "hidden md:flex md:flex-1"
          }
        `}
      >
        <div className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-white/10 bg-white/3 p-[10px] backdrop-blur-2xl md:left-[260px] lg:left-[320px]">
          <label
            className={`flex ${!isOpen ? "ml-[70px] md:ml-0" : ""} min-w-0 max-w-[560px] items-center gap-5   p-[10px] px-[50px] rounded-4xl`}
            htmlFor="search"
          >
            <div
              className={`absolute top-0 left-0 w-[200px] h-[60px] opacity-30 ${glassmorphism_base}`}
            />
            <div
              className={`absolute bottom-0 right-0 w-[200px] h-[60px] opacity-30 ${glassmorphism_base}`}
            />
            {/* <RiSearch2Line color="gray" className="ml-[-25px]" />

            <input
              id="search"
              type="text"
              className="min-w-0 outline-none border-none bg-transparent text-white"
              placeholder="Search workspace..."
            /> */}
          </label>
          <div className="flex shrink-0 items-center z-30 gap-5">
            <NotificationBell />
            <Image
              src={session?.user?.image || "/person.jpg"}
              className="rounded-full cursor-pointer"
              width={30}
              height={30}
              onClick={()=>{router.push("/settings")}}
              alt="profile"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-32 pt-20">
          {children}
        </div>

        <footer className="fixed bottom-0 left-0 right-0 z-30 mt-auto flex flex-col items-center justify-between gap-4 border-t border-white/5 bg-[#1f1f27]/40 px-6 py-4 text-xs text-gray-500 backdrop-blur-md sm:flex-row md:left-[260px] lg:left-[320px]">
          <p>© {new Date().getFullYear()} Lumina Pro. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-white/80 duration-200">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white/80 duration-200">
              Terms of Service
            </a>
            <a href="/support" className="hover:text-white/80 duration-200">
              Support
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
