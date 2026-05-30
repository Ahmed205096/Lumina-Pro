"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import {
  selectedWorkspaceKey,
  useWorkspaceState,
  type WorkspaceSummary,
} from "@/store";
import { useWorkspaceRole } from "../hooks/useWorkspaceRole";

const workspacesEndpoint = process.env.NEXT_PUBLIC_MANAGE_WORKS as string;

function getEntityId(value: WorkspaceSummary["ownerId"] | WorkspaceSummary["members"][number]["userId"]) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "WS";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getMemberCount(workspace: WorkspaceSummary) {
  const members = new Set<string>();
  const ownerId = getEntityId(workspace.ownerId);

  if (ownerId) members.add(ownerId);

  workspace.members?.forEach((member) => {
    const memberId = getEntityId(member.userId);
    if (memberId) members.add(memberId);
  });

  return members.size || workspace.members?.length || 0;
}

function getWorkspaceRole(workspace: WorkspaceSummary, userId?: string) {
  const ownerId = getEntityId(workspace.ownerId);
  if (userId && ownerId === userId) return "OWNER: YOU";

  const currentMember = workspace.members?.find(
    (member) => getEntityId(member.userId) === userId,
  );

  return currentMember?.role
    ? `ROLE: ${currentMember.role.toUpperCase()}`
    : "WORKSPACE";
}

export default function WorkspaceSwitcher() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const pathname = usePathname();
  const switcherRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 288,
  });
  const {
    workspaces,
    selectedWorkspace,
    hasLoadedWorkspaces,
    setWorkspaceData,
    setSelectedWorkspace,
  } = useWorkspaceState();

  const { role, isOwner } = useWorkspaceRole();
  const userId = session?.user?.id;
  const selectedMemberCount = selectedWorkspace
    ? getMemberCount(selectedWorkspace)
    : 0;

  const visibleAvatars = useMemo(() => {
    if (!selectedWorkspace) return [];

    const people: { id: string; name: string; image?: string }[] = [];

    const ownerId = getEntityId(selectedWorkspace.ownerId);
    if (ownerId) {
      const owner =
        typeof selectedWorkspace.ownerId === "string"
          ? null
          : selectedWorkspace.ownerId;
      people.push({
        id: ownerId,
        name: owner?.name || owner?.email || "Owner",
        image: owner?.image || undefined,
      });
    }

    selectedWorkspace.members?.forEach((member) => {
      const user = member.userId;
      const id = getEntityId(user);
      if (!id || id === ownerId) return;
      if (people.some((p) => p.id === id)) return;
      const u = typeof user === "string" ? null : user;
      people.push({
        id,
        name: u?.name || u?.email || "Member",
        image: u?.image || undefined,
      });
    });

    return people.slice(0, 3).map((person) => ({
      id: person.id,
      initials: getInitials(person.name).slice(0, 2),
      name: person.name,
      image: person.image,
    }));
  }, [selectedWorkspace]);

  const selectWorkspace = useCallback(
    (workspace: WorkspaceSummary) => {
      setSelectedWorkspace(workspace);
      localStorage.setItem(selectedWorkspaceKey, workspace.slug);
      setIsOpen(false);
    },
    [setSelectedWorkspace],
  );

  const updateMenuPosition = useCallback(() => {
    const switcherElement = switcherRef.current;
    if (!switcherElement) return;

    const rect = switcherElement.getBoundingClientRect();
    const isDesktop = window.innerWidth >= 768;
    const isLarge = window.innerWidth >= 1024;

    setMenuPosition({
      left: isDesktop ? rect.right + 12 : rect.left,
      top: isDesktop ? rect.top : rect.top + 68,
      width: isDesktop ? (isLarge ? 320 : 288) : rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  // Close dropdown on route change (e.g. browser back/forward)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (hasLoadedWorkspaces && workspaces.length > 0) return;

    let ignore = false;

    const fetchWorkspaces = async () => {
      try {
        const response = await fetch(workspacesEndpoint);

        if (!response.ok) {
          if (!ignore) {
            setWorkspaceData([], null);
          }
          return;
        }

        const data: WorkspaceSummary[] = await response.json();

        if (ignore) return;

        const storedSlug = localStorage.getItem(selectedWorkspaceKey);
        const nextSelected =
          data.find((workspace) => workspace.slug === storedSlug) || data[0] || null;

        setWorkspaceData(data, nextSelected);
      } catch (error) {
        console.error("Error loading workspaces:", error);
        if (!ignore) {
          setWorkspaceData([], null);
        }
      }
    };

    void fetchWorkspaces();

    // Fallback: if workspace data never loads within 8s, show empty state
    const fallbackTimer = setTimeout(() => {
      if (!ignore) {
        const state = useWorkspaceState.getState();
        if (!state.hasLoadedWorkspaces) {
          setWorkspaceData([], null);
        }
      }
    }, 8000);

    return () => {
      ignore = true;
      clearTimeout(fallbackTimer);
    };
  }, [hasLoadedWorkspaces, setWorkspaceData]);

  if (!hasLoadedWorkspaces) {
    return (
      <div className="mt-3 px-4">
        <div className="h-[60px] animate-pulse rounded-2xl bg-white/5" />
        <div className="mt-3 h-6 w-32 animate-pulse rounded-full bg-white/5" />
      </div>
    );
  }

  if (!selectedWorkspace) {
    return (
      <div className="mt-3 px-4">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-3 text-sm text-gray-400">
          No workspaces yet.
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[150px] z-40 px-4" ref={switcherRef}>
      <button
        className="flex h-[60px] w-full items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/6 px-3 text-left shadow-[0_14px_40px_rgba(0,0,0,0.14)] duration-200 hover:bg-white/9"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f08a24] text-base font-bold text-white">
          {getInitials(selectedWorkspace.name).slice(0, 1)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-bold leading-5 text-[#e4e1ed]">
            {selectedWorkspace.name}
          </span>
          <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase text-[#c7c4d7]">
            {isOwner ? "OWNER: YOU" : role ? `ROLE: ${role.toUpperCase()}` : "WORKSPACE"}
          </span>
        </span>
        <span className="grid shrink-0 gap-0.5 text-[#d9d6e6]">
          <IoChevronUp size={15} />
          <IoChevronDown size={15} />
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed z-[1000] overflow-visible rounded-2xl border border-white/8 bg-[#292932] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
            style={{
              left: menuPosition.left,
              top: menuPosition.top,
              width: menuPosition.width,
            }}
          >
          {workspaces.map((workspace) => (
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left duration-200 hover:bg-white/8 ${
                workspace.slug === selectedWorkspace.slug ? "bg-white/8" : ""
              }`}
              key={workspace._id}
              onClick={() => selectWorkspace(workspace)}
              type="button"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f08a24]/90 text-sm font-bold text-white">
                {getInitials(workspace.name).slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">
                  {workspace.name}
                </span>
                <span className="block truncate text-xs text-gray-400">
                  {getMemberCount(workspace)} Members
                </span>
              </span>
            </button>
          ))}
          </div>,
          document.body,
        )}

      <div className="mt-3 flex items-center gap-2">
        <div className="flex">
          {visibleAvatars.map((avatar, index) => (
            <span
              className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#1f1f27] bg-[#6e66ff] text-[10px] font-bold text-white"
              key={avatar.id}
              style={{
                marginLeft: index === 0 ? 0 : -8,
                backgroundColor: index === 0 ? "#3d3d48" : index === 1 ? "#776cff" : "#17c7df",
              }}
              title={avatar.name}
            >
              {avatar.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={avatar.name}
                  className="h-full w-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  src={avatar.image}
                />
              ) : (
                avatar.initials
              )}
            </span>
          ))}
        </div>
        <span className="text-sm font-medium text-[#c7c4d7]">
          {selectedMemberCount} Members
        </span>
      </div>
    </div>
  );
}
