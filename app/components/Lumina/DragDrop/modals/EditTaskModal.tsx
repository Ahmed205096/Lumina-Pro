"use client";

import { useState } from "react";
import type { WorkspaceMemberInfo } from "@/store";
import DatePicker from "../DatePicker";
import { safeJson, serializeTaskContent, type ApiTask } from "../kanbanUtils";
import AssigneeList from "./AssigneeList";
import ModalShell from "./ModalShell";
import PriorityPicker from "./PriorityPicker";

interface EditTaskModalProps {
  taskId: string;
  initialTitle: string;
  initialDescription: string;
  initialPeriority: "low" | "medium" | "high";
  initialDueDate: string;
  initialAssigneeIds: string[];
  members: WorkspaceMemberInfo[];
  minDueDate: string;
  onClose: () => void;
  onSaved: (task: ApiTask) => void;
}

export default function EditTaskModal({
  taskId,
  initialTitle,
  initialDescription,
  initialPeriority,
  initialDueDate,
  initialAssigneeIds,
  members,
  minDueDate,
  onClose,
  onSaved,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [periority, setPeriority] = useState(initialPeriority);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [assigneeIds, setAssigneeIds] = useState(initialAssigneeIds);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <ModalShell onClose={onClose} ariaLabel="Close edit task dialog">
      <div className="relative">
        <h2 className="mb-1 text-lg font-semibold text-white">Edit task</h2>
        <p className="mb-5 text-sm text-[#c7c4d7]/70">Update the task content or assigned members.</p>
      </div>

      <form
        className="relative space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) { setError("Title is required."); return; }
          setIsSaving(true);
          setError("");
          try {
            const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: serializeTaskContent(title, description),
                periority,
                assignedTo: assigneeIds,
                dueDate: dueDate || null,
              }),
            });
            const data = await safeJson<ApiTask | string>(res);
            if (!res.ok) { setError(typeof data === "string" ? data : "Could not save changes."); return; }
            onSaved(data as ApiTask);
          } catch (err) {
            setError((err as Error)?.message || "Could not save changes.");
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#c7c4d7]/70">Title</label>
          <input
            autoFocus
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-[#c7c4d7]/30 focus:border-[#c0c1ff]/40"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
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
          <DatePicker label="Due date" min={minDueDate} placement="top" onChange={setDueDate} value={dueDate} />
        </div>

        <AssigneeList members={members} selectedIds={assigneeIds} onChange={setAssigneeIds} />

        {error && (
          <p className="rounded-xl border border-[#93000a]/30 bg-[#93000a]/20 px-4 py-2 text-xs text-[#ffb4ab]">{error}</p>
        )}

        <div className="flex gap-2 pt-2">
          <button className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-[#c7c4d7] transition hover:bg-white/10 hover:text-white" onClick={onClose} type="button">Cancel</button>
          <button className="flex-1 rounded-xl bg-[#6366f1] py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_2px_rgba(99,102,241,0.15)] transition hover:bg-[#6366f1]/90 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
