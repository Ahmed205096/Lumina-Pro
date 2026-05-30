"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { glassmorphism_base } from "../Sidebar/Sidebar";
import InviteMemberCard from "./InviteMemberCard";
import MembersTable from "./MembersTable";
import PendingInvitesTable from "./PendingInvitesTable";
import { type PendingInvite, type TeamMember } from "./teamData";
import {
  getUserId,
  mapWorkspaceMembers,
  normalizeRole,
  type WorkspaceMembersResponse,
} from "./teamUtils";
import {
  selectedWorkspaceKey,
  useWorkspaceState,
  type WorkspaceSummary,
} from "@/store";
import { useWorkspaceRole } from "../hooks/useWorkspaceRole";

interface InviteResponse {
  invitedEmails?: { _id?: string; email: string; role: string }[];
}

const pendingInvitesEndpoint = process.env.NEXT_PUBLIC_WORKS_PENDING_INVITES as string;
const membersEndpoint = process.env.NEXT_PUBLIC_WORKS_MEMBERS as string;
const manageWorkspacesEndpoint = process.env.NEXT_PUBLIC_MANAGE_WORKS as string;

export default function TeamPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { selectedWorkspace } = useWorkspaceState();
  const selectedWorkspaceSlug = selectedWorkspace?.slug;
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isInvitesLoading, setIsInvitesLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [removingMemberIds, setRemovingMemberIds] = useState<string[]>([]);

  const { isOwnerOrAdmin: isAdmin } = useWorkspaceRole();

  const getInvites = useCallback(async () => {
    if (!selectedWorkspaceSlug || !pendingInvitesEndpoint) {
      setPendingInvites([]);
      setIsInvitesLoading(false);
      return;
    }

    setIsInvitesLoading(true);

    try {
      const response = await fetch(
        `${pendingInvitesEndpoint}?workspaceSlug=${encodeURIComponent(
          selectedWorkspaceSlug,
        )}`,
      );

      if (!response.ok) {
        setPendingInvites([]);
        return;
      }

      const data: InviteResponse = await response.json();
      setPendingInvites(
        (data.invitedEmails || []).map((invite) => ({
          id: invite._id || invite.email,
          email: invite.email,
          role: normalizeRole(invite.role),
        })),
      );
    } catch (error) {
      console.error("Error loading invites:", error);
      setPendingInvites([]);
    } finally {
      setIsInvitesLoading(false);
    }
  }, [selectedWorkspaceSlug]);

  useEffect(() => {
    queueMicrotask(() => {
      void getInvites();
    });
  }, [getInvites]);

  useEffect(() => {
    if (!selectedWorkspaceSlug || !membersEndpoint) {
      queueMicrotask(() => {
        setMembers([]);
        setIsMembersLoading(false);
      });
      return;
    }

    let ignore = false;

    const getWorkspaceMembers = async () => {
      setIsMembersLoading(true);

      try {
        const response = await fetch(
          `${membersEndpoint}${encodeURIComponent(selectedWorkspaceSlug)}`,
        );

        if (!response.ok) {
          if (!ignore) setMembers([]);
          return;
        }

        const data: WorkspaceMembersResponse = await response.json();
        if (!ignore) setMembers(mapWorkspaceMembers(data));
      } catch (error) {
        console.error("Error loading workspace members:", error);
        if (!ignore) setMembers([]);
      } finally {
        if (!ignore) setIsMembersLoading(false);
      }
    };

    void getWorkspaceMembers();

    return () => {
      ignore = true;
    };
  }, [selectedWorkspaceSlug]);

  const cancelInvite = async (email: string) => {
    if (!selectedWorkspaceSlug || !pendingInvitesEndpoint) return;

    const previousInvites = pendingInvites;
    setPendingInvites((invites) =>
      invites.filter((invite) => invite.email !== email),
    );

    try {
      const response = await fetch(pendingInvitesEndpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceSlug: selectedWorkspaceSlug,
          email,
        }),
      });

      if (!response.ok) {
        setPendingInvites(previousInvites);
      }
    } catch (error) {
      console.error("Error cancelling invite:", error);
      setPendingInvites(previousInvites);
    }
  };

  const removeMember = async (userId: string) => {
    if (!selectedWorkspaceSlug || !manageWorkspacesEndpoint) return;

    const previousMembers = members;

    setRemovingMemberIds((ids) => [...ids, userId]);
    setMembers((currentMembers) =>
      currentMembers.filter((member) => member.id !== userId),
    );

    try {
      const response = await fetch(manageWorkspacesEndpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          workspaceSlug: selectedWorkspaceSlug,
        }),
      });

      if (!response.ok) {
        setMembers(previousMembers);
        return;
      }

      const workspaceState = useWorkspaceState.getState();
      const workspacesResponse = await fetch(manageWorkspacesEndpoint);

      if (!workspacesResponse.ok) {
        const nextWorkspaces = workspaceState.workspaces.map((workspace) =>
          workspace.slug === selectedWorkspaceSlug
            ? {
                ...workspace,
                members: workspace.members.filter(
                  (member) => getUserId(member.userId) !== userId,
                ),
              }
            : workspace,
        );
        const nextSelectedWorkspace =
          nextWorkspaces.find(
            (workspace) => workspace.slug === selectedWorkspaceSlug,
          ) || workspaceState.selectedWorkspace;

        workspaceState.setWorkspaceData(nextWorkspaces, nextSelectedWorkspace);
        return;
      }

      const nextWorkspaces: WorkspaceSummary[] = await workspacesResponse.json();
      const nextSelectedWorkspace =
        nextWorkspaces.find(
          (workspace) => workspace.slug === selectedWorkspaceSlug,
        ) ||
        nextWorkspaces[0] ||
        null;

      workspaceState.setWorkspaceData(nextWorkspaces, nextSelectedWorkspace);

      if (nextSelectedWorkspace) {
        localStorage.setItem(selectedWorkspaceKey, nextSelectedWorkspace.slug);
      } else {
        localStorage.removeItem(selectedWorkspaceKey);
      }
    } catch (error) {
      console.error("Error removing member:", error);
      setMembers(previousMembers);
    } finally {
      setRemovingMemberIds((ids) =>
        ids.filter((removingId) => removingId !== userId),
      );
    }
  };

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
          <h2 className="text-3xl font-bold tracking-tight">
            Team Management
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 md:text-base">
            Manage members, access levels, and pending invitations for your
            productivity workspace.
          </p>
        </section>

        {selectedWorkspace ? (
          <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <InviteMemberCard onInviteSent={getInvites} />
            </div>
            <div className="space-y-8 xl:col-span-8">
              <MembersTable
                members={members}
                isLoading={isMembersLoading}
                workspaceName={selectedWorkspace.name}
                isAdmin={isAdmin}
                onRemoveMember={removeMember}
                removingMemberIds={removingMemberIds}
              />
              <PendingInvitesTable
                invites={pendingInvites}
                isLoading={isInvitesLoading}
                onCancelInvite={cancelInvite}
                onRefreshInvites={getInvites}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/8 bg-white/3 p-8 text-center text-gray-400">
            No workspace available.
          </div>
        )}
      </main>
    </>
  );
}
