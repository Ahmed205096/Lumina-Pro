import { glassmorphism_base } from "../../Sidebar/Sidebar";

export default function SettingsSkeleton() {
  const fieldSkeletons = Array.from({ length: 4 }, (_, index) => (
    <div className="flex flex-col gap-2 w-full" key={index}>
      <div className="h-4 w-24 rounded bg-white/8" />
      <div className="h-[60px] rounded-xl border border-white/8 bg-white/5" />
    </div>
  ));
  return (
    <>
      <div
        className={`absolute -top-20 -right-20 w-[500px] h-[600px] 
          rounded-full blur-[120px] bg-linear-to-br from-blue-400/20 to-transparent 
          opacity-30 pointer-events-none ${glassmorphism_base}`}
      />
      <div
        className={`absolute -bottom-20 -left-20 w-[500px] h-[600px] 
          rounded-full blur-[120px] bg-linear-to-br from-violet-400/20 to-transparent 
          opacity-30 pointer-events-none ${glassmorphism_base}`}
      />

      <div className="min-h-screen mt-[30px] p-6 md:p-10 max-w-7xl mx-auto w-full text-white relative animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-3 w-full max-w-xl">
            <div className="h-8 w-56 rounded bg-white/8" />
            <div className="h-4 w-full max-w-md rounded bg-white/6" />
          </div>
          <div className="h-9 w-36 rounded-full border border-white/10 bg-white/5" />
        </div>

        <div className="mt-8 rounded-3xl w-full p-6 md:p-8 bg-white/2 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-5 border-b border-white/5 pb-6">
            <div className="h-20 w-20 rounded-full bg-white/8" />
            <div className="flex flex-col gap-3">
              <div className="h-6 w-44 rounded bg-white/8" />
              <div className="h-3 w-36 rounded bg-white/6" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
              {fieldSkeletons}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="h-4 w-32 rounded bg-white/8" />
              <div className="h-[148px] rounded-xl border border-white/8 bg-white/5" />
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-end gap-5 mt-10">
          <div className="h-12 w-36 rounded-xl bg-white/6" />
          <div className="h-12 w-32 rounded-xl bg-blue-500/30" />
        </div>
      </div>
    </>
  );
}
