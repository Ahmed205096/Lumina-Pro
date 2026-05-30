import Link from "next/link";
import { FcCollaboration } from "react-icons/fc";

export default function Footer() {
  return (
    <>
      <div className="mt-[50px] py-[60px] px-[20px] md:px-[80px] flex justify-start gap-5 border-t border-white/6 bg-black/20 lg:justify-around md:justify-between  items-center flex-wrap">
        <div className="flex flex-col gap-5">
          <div className="flex gap-1 items-center">
            <FcCollaboration size={25} />
            <p className="text-[16px] font-bold">Lumina</p>
          </div>
          <p className="md:max-w-[350px] sm:max-w-[250px]">
            The world&apos;s most beautiful workspace for high-productivity teams.
          </p>
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} Lumina SaaS. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="uppercase font-bold">product</p>
          <Link href="">Features</Link>
          <Link href="">Desktop App</Link>
          <Link href="">Mobile App</Link>
        </div>
        <div className="flex flex-col gap-4">
          <p className="uppercase font-bold">resources</p>
          <Link href="">Documentation</Link>
          <Link href="">Help Center</Link>
          <Link href="">Community</Link>
        </div>
        <div className="flex flex-col gap-4">
          <p className="uppercase font-bold">legal</p>
          <Link href="">Privacy Policy</Link>
          <Link href="">Terms of Service</Link>
          <Link href="">Cookies Policy</Link>
        </div>
      </div>
    </>
  );
}
