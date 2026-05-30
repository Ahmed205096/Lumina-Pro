"use client";
import Link from "next/link";
import { RiDashboardFill } from "react-icons/ri";
import { FaChalkboardUser, FaUsersViewfinder } from "react-icons/fa6";
import { BiLogoMicrosoftTeams } from "react-icons/bi";
import { MdOutlineSettingsSuggest } from "react-icons/md";
import { LuPanelRightOpen, LuPanelLeftOpen } from "react-icons/lu";
import { IoIosExit } from "react-icons/io";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useSidebarState } from "@/store";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

export const glassmorphism_base =
  "rounded-full shadow-[0px_0px_120px_rgba(0,0,0,0.2)] bg-black/10 blur-4xl z-12";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebarState();

  const link = (
    text: string,
    href: string,
    icon: React.ReactNode,
    custome_style: string = "",
  ) => (
    <Link
      className={`ml-[-10px] mt-[5px] hover:bg-white/3 rounded-xl py-[12px] px-[20px] flex items-center gap-2 text-[16px] font-bold ${custome_style} ${pathname === href ? "bg-[#a6a0f0]/40 border-r-5" : ""}`}
      href={href}
    >
      {icon}
      {text}
    </Link>
  );

  const handleOpenClose = () => {
    setIsOpen();
  };

  const back_light_common = "absolute top-[-30px] w-[200px] h-[200px]";

  return (
    <>
      <div
        className={`
        fixed top-0 md:relative  left-0 h-screen bg-[#1f1f27]
        flex flex-col justify-between z-40 duration-300 overflow-visible
        border-r border-white/4 backdrop-blur-4xl shadow-[10px_0px_60px_rgba(0,0,0,0.2)]
        w-full md:w-[260px] lg:w-[320px] shrink-0
        ${!isOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
      `}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={`${back_light_common} left-[-30px] ${glassmorphism_base}`}
          />
          <div
            className={`${back_light_common} right-[-30px] ${glassmorphism_base}`}
          />
          <div
            className={`absolute bottom-[-50px] right-[-100px] h-[400px] w-[400px] ${glassmorphism_base}`}
          />
        </div>

        <div className="px-[30px] h-[150px]  py-[20px] flex flex-col items-start justify-center">
          <Link
            className="overflow-clip  font-bold text-[25px] text-center text-[#c1c1f8]"
            href=""
          >
            Lumina Pro
          </Link>
          <p className="text-[12px] text-gray-400 font-bold">
            Productivity Workspace
          </p>
        </div>

        <WorkspaceSwitcher />

        <div className="px-[20px] z-13 text-gray-300 flex flex-col h-full">
          {link("Dashboard", "/dashboard", <RiDashboardFill size={20} />, "mt-[30px]")}
          {link("Board", "/work-board", <FaChalkboardUser size={20} />)}
          {link("Team Members", "/team-members", <BiLogoMicrosoftTeams size={20} />)}
          {link("Team Showcase", "/team-showcase", <FaUsersViewfinder size={20} />)}
          {link("Settings", "/settings", <MdOutlineSettingsSuggest size={20} />)}
        </div>

        <button
          onClick={() => signOut()}
          className="w-fit z-13 flex overflow-clip cursor-pointer hover:text-red-400 items-center gap-2 text-[16px] font-bold mb-[20px] px-[30px] py-[20px]"
        >
          <IoIosExit size={25} />
          Logout
        </button>
      </div>

      <div
        className={`fixed cursor-pointer rounded-xl p-2 z-50 right-5 top-4 duration-300 md:hidden text-white ${!isOpen ? "hidden" : "block"}`}
      >
        <LuPanelRightOpen onClick={handleOpenClose} size={24} />
      </div>

      <div
        className={`fixed cursor-pointer rounded-xl p-2 z-50 left-5 top-2 duration-300 md:hidden text-white ${!isOpen ? "block" : "hidden"}`}
      >
        <LuPanelLeftOpen onClick={handleOpenClose} size={24} />
      </div>
    </>
  );
}
