import type { ReactNode } from "react";
import { HiOutlineX } from "react-icons/hi";

interface ModalShellProps {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: "sm" | "lg";
  ariaLabel: string;
}

export default function ModalShell({ onClose, children, maxWidth = "lg", ariaLabel }: ModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth === "sm" ? "max-w-sm" : "max-w-lg"} rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(192,193,255,0.14),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(93,230,255,0.10),transparent_50%)]" />
        <button
          aria-label={ariaLabel}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#c7c4d7] transition hover:bg-white/10 hover:text-white"
          onClick={onClose}
          type="button"
        >
          <HiOutlineX aria-hidden="true" size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
