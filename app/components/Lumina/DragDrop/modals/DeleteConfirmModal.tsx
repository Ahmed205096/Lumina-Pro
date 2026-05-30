"use client";

import { useState } from "react";

interface DeleteConfirmModalProps {
  target: { id: string; title: string };
  onClose: () => void;
  onDeleted: (taskId: string) => void;
}

export default function DeleteConfirmModal({ target, onClose, onDeleted }: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(255,100,100,0.08),transparent_55%)]" />
        <div className="relative">
          <h2 className="mb-1 text-base font-semibold text-white">Delete task?</h2>
          <p className="mb-5 text-sm text-[#c7c4d7]/70">
            <span className="font-medium text-white">&ldquo;{target.title}&rdquo;</span> will be permanently deleted.
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-[#c7c4d7] transition hover:bg-white/10 hover:text-white"
              disabled={isDeleting}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-xl bg-rose-500/80 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true);
                try {
                  const res = await fetch(`/api/tasks/${encodeURIComponent(target.id)}`, { method: "DELETE" });
                  if (res.ok) onDeleted(target.id);
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
    </div>
  );
}
