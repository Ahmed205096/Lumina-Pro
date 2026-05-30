"use client";

import { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import type { IWorkspace } from "../hooks/useDashboardData";

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWorkspace: IWorkspace | null;
  onDelete: (slug: string) => Promise<boolean>;
  deletingWorkspaceSlug: string;
  workspaceError: string;
}

export default function DeleteWorkspaceModal({
  isOpen,
  onClose,
  targetWorkspace,
  onDelete,
  deletingWorkspaceSlug,
  workspaceError,
}: DeleteWorkspaceModalProps) {
  const [deleteWorkspaceInput, setDeleteWorkspaceInput] = useState("");

  if (!isOpen || !targetWorkspace) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#464554]/30 bg-[#1f1f27] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#908fa0] hover:text-[#e4e1ed] duration-200"
          type="button"
        >
          <HiOutlineX size={20} />
        </button>

        <h3 className="mb-1 text-xl font-semibold text-[#e4e1ed]">
          Delete workspace
        </h3>
        <p className="mb-6 text-sm text-[#908fa0]">
          This action cannot be undone. Type{" "}
          <span className="font-semibold text-[#e4e1ed]">
            {targetWorkspace.name}
          </span>{" "}
          to confirm.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const success = await onDelete(targetWorkspace.slug);
            if (success) {
              setDeleteWorkspaceInput("");
              onClose();
            }
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#908fa0] uppercase tracking-wider">
              Workspace name
            </label>
            <input
              autoFocus
              type="text"
              value={deleteWorkspaceInput}
              onChange={(e) => setDeleteWorkspaceInput(e.target.value)}
              placeholder={targetWorkspace.name}
              className="w-full rounded-xl border border-[#464554]/30 bg-white/5 px-4 py-2.5 text-sm text-[#e4e1ed] outline-none placeholder:text-[#464554] focus:border-[#ffb4ab]/40 duration-200"
            />
          </div>

          {workspaceError && (
            <p className="rounded-xl border border-[#93000a]/30 bg-[#93000a]/20 px-4 py-2 text-xs text-[#ffb4ab]">
              {workspaceError}
            </p>
          )}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#464554]/30 bg-white/5 py-2.5 text-sm font-semibold text-[#e4e1ed] hover:bg-white/8 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                deletingWorkspaceSlug === targetWorkspace.slug ||
                deleteWorkspaceInput.trim().toLowerCase() !==
                  targetWorkspace.name.trim().toLowerCase()
              }
              className="flex-1 rounded-xl bg-[#93000a] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deletingWorkspaceSlug === targetWorkspace.slug
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
