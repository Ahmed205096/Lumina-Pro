"use client";

import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { MdOutlineWorkspaces } from "react-icons/md";
import { IoChevronForward } from "react-icons/io5";
import type { IWorkspace } from "./hooks/useDashboardData";

interface ActiveWorkspacesProps {
  workspaces: IWorkspace[];
  isLoading: boolean;
  workspaceError: string;
  deletingWorkspaceSlug: string;
  currentUserId: string;
  onNewWorkspaceClick: () => void;
  onDeleteWorkspaceClick: (workspace: IWorkspace) => void;
}

export default function ActiveWorkspaces({
  workspaces,
  isLoading,
  workspaceError,
  deletingWorkspaceSlug,
  currentUserId,
  onNewWorkspaceClick,
  onDeleteWorkspaceClick,
}: ActiveWorkspacesProps) {
  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
      <div className="glass-card rounded-xl p-6 flex-1 flex flex-col">
        <h3 className="text-2xl font-semibold text-[#e4e1ed] mb-6">Active Workspaces</h3>
        {workspaceError && (
          <p className="mb-3 rounded-lg border border-[#93000a]/30 bg-[#93000a]/20 px-3 py-2 text-xs text-[#ffb4ab]">
            {workspaceError}
          </p>
        )}
        <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-[320px] mb-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
            ))
          ) : workspaces.length === 0 ? (
            <p className="text-sm text-[#908fa0] text-center py-4">No workspaces yet.</p>
          ) : (
            workspaces.map((ws) => (
              <div
                key={ws._id}
                className="group flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-[#292932] border border-[#464554]/30 flex items-center justify-center shrink-0">
                  <MdOutlineWorkspaces size={20} className="text-[#c0c1ff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#e4e1ed] font-medium text-sm truncate">{ws.name}</h4>
                  <p className="text-[#908fa0] text-xs">
                    {ws.members.length} member{ws.members.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {ws.ownerId === currentUserId && (
                    <button
                      aria-label={`Delete ${ws.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#908fa0] transition hover:bg-[#93000a]/20 hover:text-[#ffb4ab] disabled:pointer-events-none disabled:opacity-50"
                      disabled={deletingWorkspaceSlug === ws.slug}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWorkspaceClick(ws);
                      }}
                      type="button"
                    >
                      <HiOutlineTrash aria-hidden="true" size={16} />
                    </button>
                  )}
                  <IoChevronForward
                    size={16}
                    className="text-[#908fa0] group-hover:text-[#c0c1ff] transition-colors"
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <button
          onClick={onNewWorkspaceClick}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#464554]/40 py-2 text-sm font-medium text-[#908fa0] transition-all hover:border-[#c0c1ff]/40 hover:text-[#c0c1ff]"
          type="button"
        >
          <HiOutlinePlus aria-hidden="true" size={18} />
          New Workspace
        </button>
      </div>
    </div>
  );
}
