"use client";
import Link from "next/link";
import { useState } from "react";
import { LuMenu } from "react-icons/lu";
import { CgMenuMotion } from "react-icons/cg";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface IProps {
  handelIsMenuOpend: (data: boolean) => void;
}

export default function NavLinks({ handelIsMenuOpend }: IProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const pathName = usePathname();
  const navLink = (href: string, label: string) => {
    const isActive = pathName === href;

    return (
      <Link className="relative group hover:text-white/80" href={href}>
        {label}
        <span
          className={`absolute top-[20px] left-1/2 h-[2px] -translate-x-1/2 bg-white transition-all duration-500 ${
            isActive ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </Link>
    );
  };

  const links_for_md = () => (
    <>
      <div className="md:flex hidden gap-8 text-[14px] opacity-80 font-bold">
        {navLink("/", "Features")}
        {navLink("/pricing", "Pricing")}
        {navLink("/about", "About")}
      </div>

      {!!session?.user?.email ? (
        <button
          className="cursor-pointer md:flex hidden"
          onClick={() => {
            signOut();
          }}
        >
          Logout
        </button>
      ) : (
        <Link
          className="md:flex  hidden bg-[#C0C1FF] text-[#1000A9] text-[15px]  font-bold h-[40px] px-[24px] rounded-xl justify-center items-center"
          href="/login"
        >
          <p className="mt-[-3px]">Sign In</p>
        </Link>
      )}
    </>
  );

  const closedMenu = () => (
    <LuMenu
      onClick={() => {
        setIsOpen(!isOpen);
        handelIsMenuOpend(!isOpen);
      }}
      size={25}
    />
  );

  const openMenu = () => (
    <CgMenuMotion
      onClick={() => {
        setIsOpen(!isOpen);
        handelIsMenuOpend(!isOpen);
      }}
      size={25}
    />
  );

  return (
    <>
      {links_for_md()}

      <div className="flex cursor-pointer md:hidden">
        {!isOpen ? closedMenu() : openMenu()}
      </div>
    </>
  );
}
