"use client";

import { useCallback, useEffect, useState } from "react";
import {
  HiOutlineCheck,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { MdOutlineSwapHoriz } from "react-icons/md";
import { useWorkspaceState } from "@/store";

type ActionType =
  | "CREATE"
  | "UPDATE_CONTENT"
  | "MOVE_STATUS"
  | "COMPLETE"
  | "INCOMPLETE"
  | "DELETE";

interface ActivityLog {
  _id: string;
  actionType: ActionType;
  taskContent: string;
  userId: { name?: string; image?: string } | null;
  details?: {
    fromStatus?: string;
    toStatus?: string;
    oldContent?: string;
    newContent?: string;
  };
  createdAt: string;
}

const ACTION_META: Record<
  ActionType,
  { label: string; icon: React.ElementType; color: string }
> = {
  CREATE: { label: "created", icon: HiOutlinePlus, color: "text-emerald-400" },
  UPDATE_CONTENT: { label: "updated", icon: HiOutlinePencil, color: "text-blue-400" },
  MOVE_STATUS: { label: "moved", icon: MdOutlineSwapHoriz, color: "text-purple-400" },
  COMPLETE: { label: "completed", icon: HiOutlineCheck, color: "text-emerald-400" },
  INCOMPLETE: { label: "reopened", icon: HiOutlineX, color: "text-amber-400" },
  DELETE: { label: "deleted", icon: HiOutlineTrash, color: "text-rose-400" },
};

const STATUS_LABEL: Record<string, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  done: "Done",
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityFeed() {
  const { selectedWorkspace } = useWorkspaceState();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    const slug = selectedWorkspace?.slug;
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/activity-logs?workspaceSlug=${slug}&limit=20`);
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspace?.slug]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="col-span-12 lg:col-span-4 glass-card rounded-xl p-6 flex h-[420px] flex-col">
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <h3 className="text-2xl font-semibold text-[#e4e1ed]">Activity</h3>
        <button
          aria-label="Refresh activity"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#908fa0] transition hover:bg-white/5 hover:text-[#c0c1ff] disabled:opacity-40"
          disabled={loading}
          onClick={fetchLogs}
          type="button"
        >
          <HiOutlineRefresh
            aria-hidden="true"
            className={`transition-transform duration-500 ${loading ? "animate-spin" : "hover:rotate-180"}`}
            size={20}
          />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        {loading && logs.length === 0 ? (
          <div className="text-sm text-[#908fa0]">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 text-sm text-[#908fa0]">
            No activity yet.
          </div>
        ) : (
          logs.map((log, i) => {
            const meta = ACTION_META[log.actionType];
            const Icon = meta.icon;
            const userName = log.userId?.name || "Someone";

            return (
              <div key={log._id} className="relative flex gap-3">
                {i < logs.length - 1 && (
                  <div className="absolute bottom-[-20px] left-4 top-8 w-px bg-[#464554]/20" />
                )}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#464554]/30 bg-[#292932] ${meta.color}`}
                >
                  <Icon aria-hidden="true" size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-[#e4e1ed]">
                    <span className="text-white">{userName}</span>{" "}
                    <span className="text-[#908fa0]">{meta.label}</span>{" "}
                    <span className="font-semibold text-[#c0c1ff]">
                      &ldquo;{log.taskContent}&rdquo;
                    </span>
                  </p>
                  {log.actionType === "MOVE_STATUS" &&
                    log.details?.fromStatus &&
                    log.details?.toStatus && (
                      <p className="mt-0.5 text-xs text-[#908fa0]">
                        {STATUS_LABEL[log.details.fromStatus] ?? log.details.fromStatus}
                        {" → "}
                        {STATUS_LABEL[log.details.toStatus] ?? log.details.toStatus}
                      </p>
                    )}
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-[#908fa0]">
                    {timeAgo(log.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
