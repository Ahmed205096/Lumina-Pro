import { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { safeJson } from "./kanbanHelpers";

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToDelete: { id: string; title: string } | null;
  workspaceSlug: string;
  onTaskDeleted: (taskId: string) => void;
}

export default function DeleteTaskModal({
  isOpen,
  onClose,
  taskToDelete,
  workspaceSlug,
  onTaskDeleted,
}: DeleteTaskModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!isOpen || !taskToDelete) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Cancel delete"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#c7c4d7] transition hover:bg-white/10 hover:text-white"
          onClick={onClose}
          type="button"
        >
          <HiOutlineX aria-hidden="true" size={18} />
        </button>

        <h2 className="mb-2 text-lg font-semibold text-rose-400">Delete task</h2>
        <p className="mb-6 text-sm text-[#c7c4d7]/80">
          Are you sure you want to delete{" "}
          <strong className="text-white">"{taskToDelete.title}"</strong>? This
          action cannot be undone.
        </p>

        {deleteError && (
          <p className="mb-4 rounded-xl border border-[#93000a]/30 bg-[#93000a]/20 px-4 py-2 text-xs text-[#ffb4ab]">
            {deleteError}
          </p>
        )}

        <div className="flex gap-2">
          <button
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-[#c7c4d7] transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_2px_rgba(244,63,94,0.15)] transition hover:bg-rose-500/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
            onClick={async () => {
              setIsDeleting(true);
              setDeleteError("");
              try {
                const res = await fetch(`/api/tasks/${encodeURIComponent(taskToDelete.id)}`, {
                  method: "DELETE",
                });
                if (!res.ok) {
                  const msg = await safeJson<string>(res);
                  setDeleteError(typeof msg === "string" ? msg : "Failed to delete task.");
                  return;
                }
                onTaskDeleted(taskToDelete.id);
                onClose();
              } catch (err) {
                setDeleteError((err as Error)?.message || "Failed to delete task.");
              } finally {
                setIsDeleting(false);
              }
            }}
            type="button"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
