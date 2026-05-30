"use client";

import { useState } from "react";
import type { WorkspaceMemberInfo } from "@/store";
import DatePicker from "../DatePicker";
import { safeJson, serializeTaskContent, type ApiTask } from "../kanbanUtils";
import AssigneeList from "./AssigneeList";
import ModalShell from "./ModalShell";
import PriorityPicker from "./PriorityPicker";

interface AddTaskModalProps {
  workspaceSlug: string;
  todoCount: number;
  members: WorkspaceMemberInfo[];
  isOwnerOrAdmin: boolean;
  minDueDate: string;
  onClose: () => void;
  onCreated: (task: ApiTask) => void;
}

export default function AddTaskModal({
  workspaceSlug,
  todoCount,
  members,
  isOwnerOrAdmin,
  minDueDate,
  onClose,
  onCreated,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [periority, setPeriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  return (
    <ModalShell onClose={onClose} ariaLabel="Close new task dialog">
      <div className="relative">
        <h2 className="mb-1 text-lg font-semibold text-white">Add task</h2>
        <p className="mb-5 text-sm text-[#c7c4d7]/70">This task will be created in the selected workspace.</p>
      </div>

      <form
        className="relative space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) { setError("Title is required."); return; }
          setIsCreating(true);
          setError("");
          try {
            const res = await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                workspaceSlug,
                content: serializeTaskContent(title, description),
                periority,
                status: "todo",
                order: todoCount,
                assignedTo: isOwnerOrAdmin ? assigneeIds : [],
                dueDate: isOwnerOrAdmin && dueDate ? dueDate : undefined,
              }),
            });
            const data = await safeJson<ApiTask | string>(res);
            if (!res.ok) { setError(typeof data === "string" ? data : "Could not create task."); return; }
            onCreated(data as ApiTask);
          } catch (err) {
            setError((err as Error)?.message || "Could not create task.");
          } finally {
            setIsCreating(false);
          }
        }}
      >
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#c7c4d7]/70">Title</label>
          <input
            autoFocus
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-[#c7c4d7]/30 focus:border-[#c0c1ff]/40"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            value={title}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#c7c4d7]/70">Description</label>
          <textarea
            className="min-h-[96px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-[#c7c4d7]/30 focus:border-[#c0c1ff]/40"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details…"
            value={description}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PriorityPicker value={periority} onChange={setPeriority} />
          <DatePicker disabled={!isOwnerOrAdmin} label="Due date" min={minDueDate} placement="top" onChange={setDueDate} value={dueDate} />
        </div>

        <AssigneeList members={members} selectedIds={assigneeIds} onChange={setAssigneeIds} locked={!isOwnerOrAdmin} />

        {error && (
          <p className="rounded-xl border border-[#93000a]/30 bg-[#93000a]/20 px-4 py-2 text-xs text-[#ffb4ab]">{error}</p>
        )}

        <div className="flex gap-2 pt-2">
          <button className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-[#c7c4d7] transition hover:bg-white/10 hover:text-white" onClick={onClose} type="button">Cancel</button>
          <button className="flex-1 rounded-xl bg-[#6366f1] py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_2px_rgba(99,102,241,0.15)] transition hover:bg-[#6366f1]/90 disabled:cursor-not-allowed disabled:opacity-60" disabled={isCreating} type="submit">
            {isCreating ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
