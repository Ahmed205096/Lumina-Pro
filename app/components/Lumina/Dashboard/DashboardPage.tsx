"use client";

import { useState } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import { MdOutlineWorkspaces } from "react-icons/md";
import { useRouter } from "next/navigation";
import ActivityFeed from "./ActivityFeed";
import ActiveWorkspaces from "./ActiveWorkspaces";
import FocusTasks from "./FocusTasks";
import CreateWorkspaceModal from "./modals/CreateWorkspaceModal";
import DeleteWorkspaceModal from "./modals/DeleteWorkspaceModal";
import { useDashboardData, type IWorkspace } from "./hooks/useDashboardData";

export default function DashboardPage() {
  const router = useRouter();
  const {
    session,
    workspaces,
    isLoading,
    deletingWorkspaceSlug,
    workspaceError,
    focusTasks,
    focusBadge,
    focusLoading,
    isOwnerOrAdmin,
    fetchWorkspaces,
    handleDeleteWorkspace,
  } = useDashboardData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteWorkspaceTarget, setDeleteWorkspaceTarget] = useState<IWorkspace | null>(null);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const currentUserId = session?.user?.id || "";

  return (
    <div className="relative min-h-screen p-6 md:p-10 pb-28 text-[#e4e1ed]">
      {/* Welcome Header */}
      <section className="mb-8">
        <h2 className="text-[32px] font-semibold leading-tight tracking-tight text-[#e4e1ed]">
          Workspace Overview
        </h2>
        <p className="mt-1 text-base text-[#c7c4d7]">
          Welcome back, {firstName}. You have {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} active.
        </p>
      </section>

      {/* 12-col grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Team Overview — col 8 */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c0c1ff]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <h3 className="text-2xl font-semibold text-[#e4e1ed] mb-8">Team Overview</h3>

          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-white/5 border border-[#464554]/20">
              <p className="text-[11px] text-[#908fa0] font-semibold uppercase tracking-widest mb-3">Total Workspaces</p>
              <p className="text-3xl font-semibold text-[#e4e1ed]">
                {isLoading ? "—" : workspaces.length}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/5 border border-[#464554]/20">
              <p className="text-[11px] text-[#908fa0] font-semibold uppercase tracking-widest mb-3">Team Members</p>
              <p className="text-3xl font-semibold text-[#e4e1ed]">
                {isLoading ? "—" : workspaces.reduce((acc, ws) => acc + ws.members.length, 0)}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/5 border border-[#464554]/20">
              <p className="text-[11px] text-[#908fa0] font-semibold uppercase tracking-widest mb-3">Pending Invites</p>
              <p className="text-3xl font-semibold text-[#ffb783]">
                {isLoading ? "—" : workspaces.reduce((acc, ws) => acc + ws.invitedEmails.length, 0)}
              </p>
            </div>
          </div>

          {!isLoading && workspaces.length > 0 && (
            <div className="mt-8 pt-8 border-t border-[#464554]/20">
              <p className="text-xs text-[#908fa0] font-semibold uppercase tracking-widest mb-4">Workspaces Breakdown</p>
              <div className="space-y-3">
                {workspaces.slice(0, 3).map((ws) => (
                  <div key={ws._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#c0c1ff]/20 flex items-center justify-center shrink-0">
                        <MdOutlineWorkspaces size={16} className="text-[#c0c1ff]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-[#e4e1ed] font-medium truncate">{ws.name}</p>
                        <p className="text-xs text-[#908fa0]">{ws.members.length} members</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#908fa0] shrink-0 ml-2">{ws.invitedEmails.length} pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Workspaces — col 4 */}
        <ActiveWorkspaces
          workspaces={workspaces}
          isLoading={isLoading}
          workspaceError={workspaceError}
          deletingWorkspaceSlug={deletingWorkspaceSlug}
          currentUserId={currentUserId}
          onNewWorkspaceClick={() => setShowCreateModal(true)}
          onDeleteWorkspaceClick={(ws) => setDeleteWorkspaceTarget(ws)}
        />

        {/* Activity Feed — col 4 */}
        <ActivityFeed />

        {/* Focus Tasks — col 8 */}
        <FocusTasks
          focusTasks={focusTasks}
          focusBadge={focusBadge}
          focusLoading={focusLoading}
          isOwnerOrAdmin={isOwnerOrAdmin}
          onNewTaskClick={() => router.push("/work-board")}
        />
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#c0c1ff] rounded-2xl flex items-center justify-center text-[#1000a9] hover:scale-110 active:scale-90 transition-all z-50 shadow-[0_0_20px_rgba(192,193,255,0.3)]"
        type="button"
      >
        <HiOutlinePlus size={28} />
      </button>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={async (createdSlug) => {
          await fetchWorkspaces(createdSlug);
        }}
      />

      {/* Delete Workspace Modal */}
      <DeleteWorkspaceModal
        isOpen={!!deleteWorkspaceTarget}
        onClose={() => setDeleteWorkspaceTarget(null)}
        targetWorkspace={deleteWorkspaceTarget}
        onDelete={handleDeleteWorkspace}
        deletingWorkspaceSlug={deletingWorkspaceSlug}
        workspaceError={workspaceError}
      />

      <style jsx>{`
        .glass-card {
          background: rgba(31, 31, 39, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(70, 69, 84, 0.3);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
