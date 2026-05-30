"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HiOutlineRefresh } from "react-icons/hi";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0d0d14] px-6">
      {/* Background glows */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-rose-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#6366f1]/10 blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
          <svg
            aria-hidden="true"
            className="text-rose-400"
            fill="none"
            height="36"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            width="36"
          >
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>

        {/* Divider */}
        <div className="mb-8 h-px w-24 bg-linear-to-r from-transparent via-white/20 to-transparent" />

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-[#e4e1ed] sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mb-3 max-w-sm text-sm leading-relaxed text-[#c7c4d7]/60">
          An unexpected error occurred. You can try again or go back home.
        </p>

        {error.digest && (
          <p className="mb-8 font-mono text-xs text-white/25">
            Error ID: {error.digest}
          </p>
        )}

        {!error.digest && <div className="mb-8" />}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl bg-rose-500/80 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(239,68,68,0.2)] transition hover:bg-rose-500 active:scale-95"
            type="button"
          >
            <HiOutlineRefresh aria-hidden="true" size={16} />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-[#c7c4d7] transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
