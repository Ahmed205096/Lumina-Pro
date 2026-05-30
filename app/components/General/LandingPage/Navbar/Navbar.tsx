"use client";
import Image from "next/image";
import NavLinks from "./NavLinks";
import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const [isMenuOpend, setIsMenuOpend] = useState(false);
  const sessionResult = useSession();
  const session = sessionResult?.data;
  
  const handelIsMenuOpend = (data: boolean) => {
    setIsMenuOpend(data);
  };
  const links_style =
    "hover:bg-white/4 duration-500 ease-in-out text-center p-[7px]";

  const nav_links_for_sm = () => (
    <div className="md:hidden flex flex-col right-0 top-[66px] border-white/10 backdrop-blur-xl z-20 bg-white/3 fixed w-full h-[200px] border-b items-center justify-center gap-3">
      <Link className={`${links_style} w-full`} href="/">
        Features
      </Link>
      <Link className={`${links_style} w-full`} href="/pricing">
        Pricing
      </Link>
      <Link className={`${links_style} w-full`} href="/about">
        About
      </Link>
      {!!session?.user?.email ? (
        <button
          onClick={() => {
            signOut();
          }}
        >
          Logout
        </button>
      ) : (
        <Link
          className={`${links_style} w-[90%] rounded-lg hover:text-[#C0C1FF] bg-[#C0C1FF] text-[#1000A9]`}
          href="/login"
        >
          <p className="mt-[-3px]">Sign In</p>
        </Link>
      )}
    </div>
  );

  return (
    <>
      <div className="z-30 flex w-full fixed  justify-between items-center py-[15px] px-[30px] backdrop-blur-xl bg-white/3 border-b  border-white/8 md:px-[75px]">
        <div className="flex justify-center items-center gap-1">
          <Image
            src="/planning.png"
            alt="Lumina logo"
            width={30}
            height={30}
            className="rounded-full cursor-pointer shadow-[0px_0_16px_rgba(255,255,255,0.27)]"
          />
          <h2 className="text-[25px] font-bold cursor-pointer">Lumina</h2>
        </div>
        <NavLinks handelIsMenuOpend={handelIsMenuOpend} />
      </div>
      {isMenuOpend ? nav_links_for_sm() : ""}
    </>
  );
}
