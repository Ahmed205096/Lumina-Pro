import { MdQueryStats } from "react-icons/md";

const panelClass =
  "rounded-3xl border border-white/8 bg-white/3 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.18)]";

export default function TeamStatsCard() {
  return (
    <section className={`${panelClass} group relative overflow-hidden p-6 md:p-8`}>
      <div className="absolute inset-0 bg-linear-to-r from-[#c1c1f8]/8 to-transparent opacity-0 duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-6">
        <div>
          <h3 className="mb-2 text-xl font-bold">Team Statistics</h3>
          <p className="max-w-xl text-sm leading-6 text-gray-400">
            Your team has increased collaboration efficiency by 24% this month.
            Keep adding members to scale your productivity.
          </p>
          <div className="mt-6 flex gap-10">
            <div>
              <p className="text-2xl font-bold text-[#42e6f5]">92%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Retention
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#c1c1f8]">12</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                New Seats
              </p>
            </div>
          </div>
        </div>
        <MdQueryStats className="hidden text-8xl text-[#c1c1f8]/10 md:block" />
      </div>
    </section>
  );
}
