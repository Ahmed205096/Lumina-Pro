import {
  HiOutlineCalendar,
  HiOutlineChatAlt2,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePaperClip,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import type { KanbanTask, TaskPriority } from "./kanbanTypes";

const priorityStyles: Record<TaskPriority, string> = {
  high: "border-rose-300/20 bg-rose-300/10 text-rose-200",
  medium: "border-[#ffb783]/20 bg-[#ffb783]/10 text-[#ffb783]",
  low: "border-[#00cbe6]/20 bg-[#00cbe6]/10 text-[#00cbe6]",
  complete: "border-[#6366f1]/20 bg-[#6366f1]/10 text-[#c0c1ff]",
};

const priorityLabels: Record<TaskPriority, string> = {
  high: "High Priority",
  medium: "Medium",
  low: "Low Priority",
  complete: "Complete",
};

interface KanbanTaskCardProps {
  task: KanbanTask;
  isDone?: boolean;
  draggable?: boolean;
  onEdit?: (task: KanbanTask) => void;
  onDelete?: (task: KanbanTask) => void;
}

export default function KanbanTaskCard({
  task,
  isDone = false,
  draggable = true,
  onEdit,
  onDelete,
}: KanbanTaskCardProps) {
  return (
    <article
      className={`group relative rounded-2xl border border-white/10 bg-[#292932]/55 p-5 backdrop-blur-xl transition duration-300 ${
        draggable
          ? "cursor-grab hover:-translate-y-0.5 hover:border-[#c0c1ff]/30 hover:bg-[#34343d]/70 active:cursor-grabbing active:scale-[0.98]"
          : "cursor-not-allowed opacity-80"
      } ${
        isDone ? "opacity-80 grayscale-[0.15]" : ""
      }`}
    >
      {(onEdit || onDelete) ? (
        <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit ? (
            <button
              aria-label="Edit task"
              className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-[#292932] text-[#c7c4d7]/50 transition hover:border-[#c0c1ff]/30 hover:bg-white/10 hover:text-white"
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              type="button"
            >
              <HiOutlinePencil aria-hidden="true" size={14} />
            </button>
          ) : null}
          {onDelete ? (
            <button
              aria-label="Delete task"
              className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-[#292932] text-[#c7c4d7]/50 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300"
              onClick={(e) => { e.stopPropagation(); onDelete(task); }}
              type="button"
            >
              <HiOutlineTrash aria-hidden="true" size={14} />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[task.priority]}`}
        >
          {priorityLabels[task.priority]}
        </span>

        {task.priority === "complete" ? (
          <HiOutlineCheckCircle
            aria-hidden="true"
            className="shrink-0 text-[#c0c1ff]"
            size={20}
          />
        ) : task.attachments ? (
          <span className="flex items-center gap-1 text-[#c7c4d7]/50">
            <HiOutlinePaperClip aria-hidden="true" size={18} />
            <span className="text-xs font-semibold">{task.attachments}</span>
          </span>
        ) : null}
      </div>

      <h2 className="mb-2 text-base font-semibold text-white">{task.title}</h2>
      <p className="mb-5 line-clamp-2 text-sm leading-6 text-[#c7c4d7]/70">
        {task.description}
      </p>

      {typeof task.progress === "number" ? (
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-[#00cbe6] shadow-[0_0_12px_rgba(0,203,230,0.4)]"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-3 text-[#c7c4d7]/55">
          {task.dueLabel ? (
            <span className="flex items-center gap-1.5">
              {isDone ? (
                <HiOutlineCalendar aria-hidden="true" size={16} />
              ) : (
                <HiOutlineClock aria-hidden="true" size={16} />
              )}
              <span className="text-xs font-medium">{task.dueLabel}</span>
            </span>
          ) : null}

          {task.comments ? (
            <span className="flex items-center gap-1.5">
              <HiOutlineChatAlt2 aria-hidden="true" size={16} />
              <span className="text-xs font-medium">{task.comments}</span>
            </span>
          ) : null}

          {task.isActive ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#00cbe6]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00cbe6]" />
              Active
            </span>
          ) : null}
        </div>

        {task.assignees.length > 0 ? (
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((a, i) => (
              <span
                key={a.id}
                className={`relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#292932] text-[10px] font-bold text-[#13131b] ${
                  a.image ? "" : task.accent
                }`}
                style={{ zIndex: 3 - i }}
                title={a.name}
              >
                {a.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={a.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    src={a.image}
                  />
                ) : (
                  a.name.trim().slice(0, 1).toUpperCase()
                )}
              </span>
            ))}
            {task.assignees.length > 3 && (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-[#292932] bg-white/10 text-[9px] font-bold text-white/70">
                +{task.assignees.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className={`grid h-7 w-7 place-items-center rounded-full border border-white/10 text-[10px] font-bold text-[#13131b] ${task.accent}`}>
            {task.assignee}
          </span>
        )}
      </div>
    </article>
  );
}
