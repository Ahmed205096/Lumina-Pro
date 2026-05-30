"use client";

import { HiOutlineCheck, HiOutlineFilter, HiOutlineLink, HiOutlinePlus } from "react-icons/hi";
import type { FocusTaskItem } from "./hooks/useDashboardData";

interface FocusTasksProps {
  focusTasks: FocusTaskItem[];
  focusBadge: string;
  focusLoading: boolean;
  isOwnerOrAdmin: boolean;
  onNewTaskClick: () => void;
}

export default function FocusTasks({
  focusTasks,
  focusBadge,
  focusLoading,
  isOwnerOrAdmin,
  onNewTaskClick,
}: FocusTasksProps) {
  return (
    <div className="col-span-12 lg:col-span-8 glass-card rounded-xl p-6 flex h-[420px] flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-semibold text-[#e4e1ed]">Focus Tasks</h3>
          <span className="px-2 py-0.5 bg-[#c0c1ff]/20 text-[#c0c1ff] text-[10px] font-bold rounded">
            {focusBadge}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Filter focus tasks"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#908fa0] transition hover:bg-white/5 hover:text-[#c0c1ff]"
            type="button"
          >
            <HiOutlineFilter aria-hidden="true" size={20} />
          </button>
          {isOwnerOrAdmin && (
            <button
              className="flex items-center gap-2 rounded-lg bg-[#c0c1ff] px-4 py-2 text-sm font-semibold text-[#1000a9] transition-all hover:opacity-90 active:scale-95"
              type="button"
              onClick={onNewTaskClick}
            >
              <HiOutlinePlus aria-hidden="true" size={18} />
              New Task
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {focusLoading ? (
          <div className="rounded-xl border border-[#464554]/10 bg-white/4 p-4 text-sm text-[#908fa0]">
            Loading focus tasks...
          </div>
        ) : focusTasks.length === 0 ? (
          <div className="rounded-xl border border-[#464554]/10 bg-white/4 p-4 text-sm text-[#908fa0]">
            No urgent tasks right now.
          </div>
        ) : (
          focusTasks.map((task, i) => {
            const DueIcon = task.dueIcon;

            return (
              <div
                key={i}
                className="group flex items-center justify-between p-4 hover:bg-white/5 rounded-xl border border-transparent hover:border-[#464554]/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <button
                    aria-label={`Mark ${task.title} complete`}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-[#464554]/30 text-transparent transition-colors group-hover:border-[#c0c1ff] group-hover:text-[#c0c1ff]"
                    type="button"
                  >
                    <HiOutlineCheck aria-hidden="true" size={15} />
                  </button>
                  <div>
                    <h4 className="text-[#e4e1ed] text-base font-normal group-hover:text-[#c0c1ff] transition-colors">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[#908fa0] flex items-center gap-1">
                        <HiOutlineLink aria-hidden="true" size={14} />
                        {task.project}
                      </span>
                      <span className="w-1 h-1 bg-[#464554]/40 rounded-full" />
                      <span className={`text-[10px] flex items-center gap-1 font-bold ${task.dueColor}`}>
                        <DueIcon aria-hidden="true" size={14} />
                        {task.due}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {task.assignees.map((a, j) => (
                    <div
                      key={j}
                      className={`w-7 h-7 overflow-hidden rounded-full border-2 border-[#1f1f27] flex items-center justify-center text-[10px] font-bold ${
                        a.image ? "bg-[#292932]" : "bg-[#00cbe6] text-[#00515d]"
                      }`}
                      title={a.label}
                    >
                      {a.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={a.label}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          src={a.image}
                        />
                      ) : (
                        a.label
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
