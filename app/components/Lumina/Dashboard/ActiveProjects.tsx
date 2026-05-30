"use client";

import { useEffect, useState } from "react";
import { MdAnalytics, MdChevronRight, MdDesignServices } from "react-icons/md";
import { panelClass } from "./dashboardData";

const projectIcons = [
  <MdAnalytics key="analytics" size={22} />,
  <MdDesignServices key="design" size={22} />,
];

const iconTones = ["text-[#c1c1f8]", "text-[#42e6f5]", "text-orange-300", "text-green-400"];

interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  members?: unknown[];
}

const manageWorksEndpoint = process.env.NEXT_PUBLIC_MANAGE_WORKS as string;

const createSlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function ActiveProjects() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(manageWorksEndpoint);
      if (!response.ok) {
        setWorkspaces([]);
        return;
      }
      const data: Workspace[] = await response.json();
      setWorkspaces(data);
    } catch {
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    fetch(manageWorksEndpoint)
      .then((r) => (r.ok ? (r.json() as Promise<Workspace[]>) : []))
      .then((data) => { if (!ignore) setWorkspaces(data); })
      .catch(() => { if (!ignore) setWorkspaces([]); })
      .finally(() => { if (!ignore) setIsLoading(false); });
    return () => { ignore = true; };
  }, []);

  const handleCreateWorkspace = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage("");

    try {
      const response = await fetch(manageWorksEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName,
          slug: createSlug(workspaceName),
          description,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        setMessage(typeof err === "string" ? err : "Could not create workspace.");
        return;
      }

      setWorkspaceName("");
      setDescription("");
      setShowForm(false);
      setMessage("");
      await loadWorkspaces();
    } catch {
      setMessage("Could not create workspace.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section
      className={`${panelClass} flex flex-col overflow-hidden p-4 sm:p-5 md:p-6 lg:w-[400px] lg:shrink-0`}
    >
      <h3 className="mb-5 shrink-0 text-xl font-bold text-white">
        Active Projects
      </h3>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {isLoading && (
          <p className="rounded-xl border border-white/8 bg-white/4 p-4 text-sm text-gray-400">
            Loading workspaces…
          </p>
        )}

        {!isLoading && workspaces.length === 0 && !showForm && (
          <p className="rounded-xl border border-white/8 bg-white/4 p-4 text-sm text-gray-400">
            No workspaces yet.
          </p>
        )}

        {workspaces.map((workspace, i) => (
          <button
            key={workspace._id}
            type="button"
            className="group flex w-full items-center gap-4 rounded-lg p-3 text-left transition-all duration-200 hover:bg-white/5"
          >
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 ${iconTones[i % iconTones.length]}`}
            >
              {projectIcons[i % projectIcons.length]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">
                {workspace.name}
              </span>
              <span className="text-xs text-gray-400">
                {workspace.members?.length ?? 0} members
              </span>
            </span>
            <MdChevronRight
              size={20}
              className="shrink-0 text-gray-500 transition-colors duration-200 group-hover:text-[#c1c1f8]"
            />
          </button>
        ))}
      </div>

      {showForm ? (
        <form
          className="mt-4 shrink-0 space-y-3"
          onSubmit={handleCreateWorkspace}
        >
          <input
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#c1c1f8]/50 transition-colors"
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Workspace name"
            required
            value={workspaceName}
          />
          <input
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#c1c1f8]/50 transition-colors"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            value={description}
          />
          {message && <p className="text-xs text-red-400">{message}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setMessage(""); }}
              className="flex-1 h-10 rounded-lg border border-white/15 text-sm text-gray-400 hover:text-white hover:border-white/30 transition-all"
            >
              Cancel
            </button>
            <button
              className="flex-1 h-10 rounded-lg bg-[#c1c1f8] text-sm font-bold text-[#13131b] hover:bg-[#d8d7ff] disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              disabled={isCreating}
              type="submit"
            >
              {isCreating ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-4 w-full shrink-0 rounded-lg border border-dashed border-white/20 py-3 text-sm text-gray-400 transition-all hover:border-[#c1c1f8]/50 hover:text-[#c1c1f8]"
        >
          + New Workspace
        </button>
      )}
    </section>
  );
}
