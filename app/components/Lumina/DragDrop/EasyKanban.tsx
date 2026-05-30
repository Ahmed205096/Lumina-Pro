"use client";

import { useMemo, useState } from "react";
import { getWorkspaceMembersInfo, useWorkspaceState } from "@/store";
import { useWorkspaceRole } from "../hooks/useWorkspaceRole";
import KanbanBoardHeader from "./KanbanBoardHeader";
import KanbanColumn from "./KanbanColumn";
import { kanbanColumns } from "./kanbanData";
import type { KanbanTask } from "./kanbanTypes";
import { toKanbanTask, toLocalDateInputValue, type ApiTask } from "./kanbanUtils";
import { useKanbanBoard } from "./hooks/useKanbanBoard";
import AddTaskModal from "./modals/AddTaskModal";
import EditTaskModal from "./modals/EditTaskModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

type EditTarget = {
  id: string; title: string; description: string;
  periority: "low" | "medium" | "high"; dueDate: string; assigneeIds: string[];
};

export default function EasyKanban() {
  const { isOwnerOrAdmin, currentUserId: roleCurrentUserId } = useWorkspaceRole();
  const currentUserId = roleCurrentUserId || "";
  const { selectedWorkspace } = useWorkspaceState();
  const selectedWorkspaceSlug = selectedWorkspace?.slug;
  const workspaceName = selectedWorkspace?.name;
  const members = useMemo(() => getWorkspaceMembersInfo(selectedWorkspace), [selectedWorkspace]);
  const minDueDate = useMemo(() => toLocalDateInputValue(new Date()), []);

  const { tasksByColumn, setTasksByColumn, lastPersistRef, isLoading, loadError, todoCount, updateColumn, canDragTask } =
    useKanbanBoard({ selectedWorkspaceSlug, isOwnerOrAdmin, currentUserId });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const openEdit = (task: KanbanTask) =>
    setEditTarget({
      id: task.id,
      title: task.title,
      description: task.description === "No description." ? "" : task.description,
      periority: task.periority ?? "medium",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      assigneeIds: task.assigneeIds ?? [],
    });

  return (
    <main className="relative min-h-[calc(100vh-120px)] overflow-hidden p-6 text-[#e4e1ed] md:p-8">
      <div className="pointer-events-none absolute right-0 top-[-60px] bg-[radial-gradient(circle_at_top_left,rgba(192,193,255,0.1),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(93,230,255,0.06),transparent_36%)]" />

      <div className="relative z-10 flex min-h-[calc(100vh-176px)] flex-col">
        <KanbanBoardHeader
          onAddTask={() => setIsAddOpen(true)}
          workspaceName={workspaceName}
          members={members.map((m) => ({ id: m.id, name: m.name, image: m.image }))}
          isOwnerOrAdmin={isOwnerOrAdmin}
        />

        {isLoading && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#c7c4d7]/80">Loading tasks…</div>
        )}
        {!isLoading && loadError && (
          <div className="mb-6 rounded-2xl border border-[#93000a]/30 bg-[#93000a]/20 p-4 text-sm text-[#ffb4ab]">{loadError}</div>
        )}

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden xl:grid-cols-3">
          {kanbanColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id]}
              setTasks={updateColumn(column.id)}
              canDragTask={canDragTask}
              onEditTask={isOwnerOrAdmin ? openEdit : undefined}
              onDeleteTask={isOwnerOrAdmin ? (t) => setDeleteTarget({ id: t.id, title: t.title }) : undefined}
            />
          ))}
        </div>
      </div>

      {isAddOpen && selectedWorkspaceSlug && (
        <AddTaskModal
          workspaceSlug={selectedWorkspaceSlug}
          todoCount={todoCount}
          members={members}
          isOwnerOrAdmin={isOwnerOrAdmin}
          minDueDate={minDueDate}
          onClose={() => setIsAddOpen(false)}
          onCreated={(task: ApiTask) => {
            const kanban = toKanbanTask(task);
            setTasksByColumn((cur) => ({ ...cur, todo: [...cur.todo, kanban] }));
            lastPersistRef.current[task._id] = { status: task.status, order: task.order ?? todoCount };
            setIsAddOpen(false);
          }}
        />
      )}

      {editTarget && (
        <EditTaskModal
          taskId={editTarget.id}
          initialTitle={editTarget.title}
          initialDescription={editTarget.description}
          initialPeriority={editTarget.periority}
          initialDueDate={editTarget.dueDate}
          initialAssigneeIds={editTarget.assigneeIds}
          members={members}
          minDueDate={minDueDate}
          onClose={() => setEditTarget(null)}
          onSaved={(task: ApiTask) => {
            const updated = toKanbanTask(task);
            setTasksByColumn((cur) => {
              const next = { ...cur };
              for (const col of Object.keys(next) as (keyof typeof next)[]) {
                next[col] = next[col].map((t) => (t.id === editTarget.id ? updated : t));
              }
              return next;
            });
            setEditTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={(taskId) => {
            setTasksByColumn((cur) => {
              const next = { ...cur };
              for (const col of Object.keys(next) as (keyof typeof next)[]) {
                next[col] = next[col].filter((t) => t.id !== taskId);
              }
              return next;
            });
            setDeleteTarget(null);
          }}
        />
      )}
    </main>
  );
}
