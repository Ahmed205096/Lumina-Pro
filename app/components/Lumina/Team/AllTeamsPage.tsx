"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { glassmorphism_base } from "../Sidebar/Sidebar";
import MembersDirectoryTable from "./MembersDirectoryTable";
import { selectedWorkspaceKey, useWorkspaceState, type WorkspaceSummary } from "@/store";
import { useWorkspaceRole } from "../hooks/useWorkspaceRole";
import type { TeamMember } from "./teamData";
import { mapWorkspaceMembers, type WorkspaceMembersResponse } from "./teamUtils";

const manageWorkspacesEndpoint = process.env.NEXT_PUBLIC_MANAGE_WORKS as string;
const membersEndpoint = process.env.NEXT_PUBLIC_WORKS_MEMBERS as string;

export default function AllTeamsPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const {
    workspaces,
    hasLoadedWorkspaces,
    setWorkspaceData,
    selectedWorkspace,
  } = useWorkspaceState();

  const [teamsBySlug, setTeamsBySlug] = useState<Record<string, TeamMember[]>>({});
  const [loadingSlugs, setLoadingSlugs] = useState<Record<string, boolean>>({});

  // Ensure we have workspaces loaded (same behavior as WorkspaceSwitcher).
  useEffect(() => {
    if (hasLoadedWorkspaces) return;
    let ignore = false;

    const fetchWorkspaces = async () => {
      try {
        const res = await fetch(manageWorkspacesEndpoint);
        if (!res.ok) {
          if (!ignore) setWorkspaceData([], null);
          return;
        }
        const data: WorkspaceSummary[] = await res.json();
        if (ignore) return;
        const storedSlug = localStorage.getItem(selectedWorkspaceKey);
        const nextSelected =
          data.find((w) => w.slug === storedSlug) || data[0] || null;
        setWorkspaceData(data, nextSelected);
      } catch {
        if (!ignore) setWorkspaceData([], null);
      }
    };

    void fetchWorkspaces();
    return () => {
      ignore = true;
    };
  }, [hasLoadedWorkspaces, setWorkspaceData]);

  // Load members for each workspace.
  useEffect(() => {
    if (!membersEndpoint) return;
    if (!workspaces.length) return;

    let ignore = false;

    const loadOne = async (slug: string) => {
      setLoadingSlugs((prev) => ({ ...prev, [slug]: true }));
      try {
        const res = await fetch(`${membersEndpoint}${encodeURIComponent(slug)}`);
        if (!res.ok) {
          if (!ignore) setTeamsBySlug((prev) => ({ ...prev, [slug]: [] }));
          return;
        }
        const data = (await res.json()) as WorkspaceMembersResponse;
        if (ignore) return;
        setTeamsBySlug((prev) => ({ ...prev, [slug]: mapWorkspaceMembers(data, false) }));
      } catch {
        if (!ignore) setTeamsBySlug((prev) => ({ ...prev, [slug]: [] }));
      } finally {
        if (!ignore) setLoadingSlugs((prev) => ({ ...prev, [slug]: false }));
      }
    };

    // Load sequentially-ish: kick them all, UI can fill as they arrive.
    workspaces.forEach((w) => void loadOne(w.slug));

    return () => {
      ignore = true;
    };
  }, [workspaces, membersEndpoint]);

  const { isOwnerOrAdmin: isAdminForSelected } = useWorkspaceRole();

  return (
    <>
      <div
        className={`absolute overflow-y-clip -top-20 -right-20 h-[600px] w-[500px] rounded-full bg-linear-to-br from-blue-400/20 to-transparent opacity-30 blur-[120px] pointer-events-none ${glassmorphism_base}`}
      />
      <div
        className={`absolute -bottom-20 -left-20 h-[600px] w-[500px] rounded-full bg-linear-to-br from-violet-400/20 to-transparent opacity-30 blur-[120px] pointer-events-none ${glassmorphism_base}`}
      />

      <main className="relative mx-auto min-h-screen w-full max-w-7xl px-4 pb-28 pt-6 text-white sm:px-6 md:p-10">
        <section className="mb-8 border-b border-white/10 pb-6">
          <h2 className="text-3xl font-bold tracking-tight">Team Directory</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 md:text-base">
            Browse the team in each workspace, including contact info and local time.
          </p>
        </section>

        <div className="space-y-8">
          {workspaces.map((ws) => (
            <section key={ws.slug} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{ws.name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {ws.slug}
                  </p>
                </div>
                {loadingSlugs[ws.slug] ? (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-[#c1c1f8]">
                    Loading…
                  </span>
                ) : (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-[#c1c1f8]">
                    {(teamsBySlug[ws.slug]?.length ?? 0)} members
                  </span>
                )}
              </div>

              <MembersDirectoryTable
                isAdmin={isAdminForSelected && selectedWorkspace?.slug === ws.slug}
                isLoading={Boolean(loadingSlugs[ws.slug])}
                members={teamsBySlug[ws.slug] || []}
                removingMemberIds={[]}
                workspaceName={ws.name}
              />
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
