"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { HiOutlineX } from "react-icons/hi";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdSlug: string) => Promise<void>;
}

const endpoint = process.env.NEXT_PUBLIC_MANAGE_WORKS as string;

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWorkspaceModalProps) {
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setForm((prev) => ({
      ...prev,
      name: value,
      slug,
    }));
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data === "string" ? data : "Failed to create workspace.",
        );
        return;
      }
      const createdSlug = form.slug;
      setForm({ name: "", slug: "", description: "" });
      await onSuccess(createdSlug);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h3 className="mb-1 text-xl font-semibold text-[#e4e1ed]">New Workspace</h3>
        <p className="mb-6 text-sm text-[#908fa0]">
          Create a workspace to collaborate with your team.
        </p>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#908fa0] uppercase tracking-wider">
              Name <span className="text-[#ffb4ab]">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Workspace"
              className="w-full rounded-xl border border-[#464554]/30 bg-white/5 px-4 py-2.5 text-sm text-[#e4e1ed] outline-none placeholder:text-[#464554] focus:border-[#c0c1ff]/50 duration-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#908fa0] uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="What is this workspace for?"
              rows={3}
              className="w-full resize-none rounded-xl border border-[#464554]/30 bg-white/5 px-4 py-2.5 text-sm text-[#e4e1ed] outline-none placeholder:text-[#464554] focus:border-[#c0c1ff]/50 duration-200"
            />
          </div>
          {error && (
            <p className="rounded-xl border border-[#93000a]/30 bg-[#93000a]/20 px-4 py-2 text-xs text-[#ffb4ab]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-xl bg-[#c0c1ff] py-2.5 text-sm font-semibold text-[#1000a9] hover:opacity-90 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}
