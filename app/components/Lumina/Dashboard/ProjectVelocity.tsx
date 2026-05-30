import { MdMoreHoriz } from "react-icons/md";
import { panelClass, velocityBars, weekDays } from "./dashboardData";

export default function ProjectVelocity() {
  if (weekDays.length === 0 || velocityBars.length === 0) {
    return (
      <section
        className={`${panelClass} relative flex h-[500px] min-w-0 flex-col overflow-hidden p-4 sm:p-5 md:p-6 lg:flex-1`}
      >
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c1c1f8]/8 blur-3xl" />
        <div className="relative mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-bold">Project Velocity</h3>
        </div>
        <div className="grid flex-1 place-items-center rounded-2xl border border-white/8 bg-white/3 text-sm text-gray-400">
          No velocity data yet.
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${panelClass} relative flex h-[500px] min-w-0 flex-col overflow-hidden p-4 sm:p-5 md:p-6 lg:flex-1`}
    >
      <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c1c1f8]/8 blur-3xl" />
      <div className="relative mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold">Project Velocity</h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-gray-400">
            Last 30 Days
          </span>
          <button
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-[#c1c1f8]"
            type="button"
          >
            <MdMoreHoriz size={22} />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 border-b border-white/8 px-1 pb-8 md:px-2">
        <div className="absolute inset-x-4 bottom-10 top-2 flex items-end justify-between opacity-70">
          {velocityBars.map((height, index) => (
            <div
              className="w-4 rounded-t-lg bg-[#c1c1f8]/25 sm:w-6 md:w-8"
              key={weekDays[index]}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="relative z-10 flex h-full items-end justify-between px-1">
          {weekDays.map((day) => (
            <span className="text-[10px] font-semibold text-gray-500" key={day}>
              {day}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid shrink-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            Tasks Completed
          </p>
          <p className="text-2xl font-bold">
            124 <span className="text-sm text-[#42e6f5]">+12%</span>
          </p>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            Avg. Cycle Time
          </p>
          <p className="text-2xl font-bold">
            3.2d <span className="text-sm text-rose-300">-0.5d</span>
          </p>
        </div>
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            Sprint Progress
          </p>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-white/5">
              <div className="h-full w-[78%] rounded-full bg-[#42e6f5] shadow-[0_0_18px_rgba(66,230,245,0.25)]" />
            </div>
            <span className="text-sm font-semibold">78%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
