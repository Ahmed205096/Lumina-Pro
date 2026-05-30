import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0d0d14] px-6">
      {/* Background glows */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#6366f1]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#00cbe6]/10 blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 404 number */}
        <div className="relative mb-6 select-none">
          <span className="bg-linear-to-b from-[#c0c1ff] to-[#6366f1]/40 bg-clip-text text-[clamp(100px,20vw,160px)] font-black leading-none tracking-tight text-transparent">
            404
          </span>
          <div className="absolute inset-0 bg-linear-to-b from-[#c0c1ff]/20 to-transparent blur-2xl" />
        </div>

        {/* Divider */}
        <div className="mb-8 h-px w-24 bg-linear-to-r from-transparent via-white/20 to-transparent" />

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-[#e4e1ed] sm:text-3xl">
          Page not found
        </h1>
        <p className="mb-10 max-w-sm text-sm leading-relaxed text-[#c7c4d7]/60">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.3)] transition hover:bg-[#6366f1]/90 active:scale-95"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-[#c7c4d7] transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
