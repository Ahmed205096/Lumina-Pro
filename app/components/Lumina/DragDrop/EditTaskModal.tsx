import { useState, useMemo, useEffect } from "react";
import { HiOutlineX } from "react-icons/hi";
import DatePicker from "./DatePicker";
import { safeJson, serializeTaskContent, toKanbanTask } from "./kanbanHelpers";
import type { ApiTask } from "./kanbanHelpers";
import type { KanbanTask } from "./kanbanTypes";
import type { WorkspaceMember } from "./hooks/useWorkspaceRole";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit: KanbanTask | null;
  workspaceSlug: string;
  isOwnerOrAdmin: boolean;
  members: WorkspaceMember[];
  onTaskUpdated: (task: KanbanTask, dbTask: ApiTask) => void;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  taskToEdit,
  workspaceSlug,
  isOwnerOrAdmin,
  members,
  onTaskUpdated,
}: EditTaskModalProps) {
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPeriority, setEditPeriority] = useState<"low" | "medium" | "high">("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editAssigneeIds, setEditAssigneeIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const minDueDate = useMemo(() => {
    const value = new Date();
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (isOpen && taskToEdit) {
      setEditTitle(taskToEdit.title || "");
      setEditDescription(taskToEdit.description || "");
      setEditPeriority(taskToEdit.periority || "medium");
      setEditDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split("T")[0] : "");
      setEditAssigneeIds(taskToEdit.assigneeIds || []);
      setEditError("");
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen || !taskToEdit) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(192,193,255,0.14),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(93,230,255,0.10),transparent_50%)]" />
        <button
          aria-label="Close edit dialog"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#c7c4d7] transition hover:bg-white/10 hover:text-white"
          onClick={onClose}
          type="button"
        >
          <HiOutlineX aria-hidden="true" size={18} />
        </button>

        <div className="relative">
          <h2 className="mb-1 text-lg font-semibold text-white">Edit task</h2>
          <p className="mb-5 text-sm text-[#c7c4d7]/70">
            Make changes to the task details below.
          </p>
        </div>

        <form
          className="relative space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editTitle.trim()) {
              setEditError("Title is required.");
              return;
            }

            setIsSaving(true);
            setEditError("");

            try {
              const res = await fetch(`/api/tasks/${encodeURIComponent(taskToEdit.id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  content: serializeTaskContent(editTitle, editDescription),
                  periority: editPeriority,
                  assignedTo: isOwnerOrAdmin ? editAssigneeIds : [],
                  dueDate: isOwnerOrAdmin && editDueDate ? editDueDate : undefined,
                }),
              });

              const data = await safeJson<ApiTask | string>(res);
              if (!res.ok) {
                setEditError(typeof data === "string" ? data : "Could not save task.");
                return;
              }

              const updated = data as ApiTask;
              onTaskUpdated(toKanbanTask(updated), updated);
              onClose();
            } catch (err) {
              setEditError((err as Error)?.message || "Could not save task.");
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#c7c4d7]/70">
              Title
            </label>
            <input
              autoFocus
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-[#c7c4d7]/30 focus:border-[#c0c1ff]/40 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isOwnerOrAdmin}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="What needs to be done?"
              value={editTitle}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#c7c4d7]/70">
              Description
            </label>
            <textarea
              className="min-h-[96px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-[#c7c4d7]/30 focus:border-[#c0c1ff]/40 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isOwnerOrAdmin}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Optional details…"
              value={editDescription}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#c7c4d7]/70">
                Priority
              </label>
              <div className="flex h-11 gap-2">
                {(
                  [
                    { value: "low", label: "Low", active: "border-[#00cbe6] bg-[#00cbe6]/15 text-[#00cbe6]" },
                    { value: "medium", label: "Med", active: "border-[#ffb783] bg-[#ffb783]/15 text-[#ffb783]" },
                    { value: "high", label: "High", active: "border-rose-400 bg-rose-400/15 text-rose-300" },
                  ] as const
                ).map((opt) => (
                  <button
                    className={`flex-1 rounded-xl border text-xs font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      editPeriority === opt.value
                        ? opt.active
                        : "border-white/10 bg-white/5 text-[#c7c4d7]/50 hover:bg-white/10 hover:text-[#c7c4d7]"
                    }`}
                    disabled={!isOwnerOrAdmin}
                    key={opt.value}
                    onClick={() => setEditPeriority(opt.value)}
                    type="button"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <DatePicker
              disabled={!isOwnerOrAdmin}
              label="Due date"
              min={minDueDate}
              placement="top"
              onChange={setEditDueDate}
              value={editDueDate}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#c7c4d7]/70">
              Assign to
            </label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-white/3 p-3">
              {!isOwnerOrAdmin ? (
                <p className="text-xs text-[#c7c4d7]/60">
                  Only workspace owner/admin can reassign tasks.
                </p>
              ) : members.length === 0 ? (
                <p className="text-xs text-[#c7c4d7]/60">No members found.</p>
              ) : (
                members.map((member) => {
                  const checked = editAssigneeIds.includes(member.id);
                  return (
                    <label
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/8"
                      key={member.id}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {member.name}
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-[#c7c4d7]/60">
                          {member.role}
                        </span>
                      </span>
                      <input
                        checked={checked}
                        onChange={() => {
                          setEditAssigneeIds((current) =>
                            checked
                              ? current.filter((id) => id !== member.id)
                              : [...current, member.id],
                          );
                        }}
                        type="checkbox"
                      />
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {editError ? (
            <p className="rounded-xl border border-[#93000a]/30 bg-[#93000a]/20 px-4 py-2 text-xs text-[#ffb4ab]">
              {editError}
            </p>
          ) : null}

          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-[#c7c4d7] transition hover:bg-white/10 hover:text-white"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-xl bg-[#6366f1] py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_2px_rgba(99,102,241,0.15)] transition hover:bg-[#6366f1]/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving || !isOwnerOrAdmin}
              type="submit"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
