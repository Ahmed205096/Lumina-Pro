"use client";

import { useCallback, useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { HiOutlineClock, HiOutlineExclamation } from "react-icons/hi";
import { useSession } from "next-auth/react";
import { selectedWorkspaceKey, useWorkspaceState } from "@/store";
import { useWorkspaceRole } from "../../hooks/useWorkspaceRole";

export interface IWorkspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  members: { userId: string; role: string; joinedAt: string }[];
  invitedEmails: { email: string; role: string }[];
  createdAt: string;
}

export type FocusTaskItem = {
  title: string;
  project: string;
  due: string;
  dueColor: string;
  dueIcon: IconType;
  assignees: { label: string; image?: string }[];
};

type ApiTask = {
  _id: string;
  content: string;
  periority?: "low" | "medium" | "high";
  status?: "todo" | "inProgress" | "done";
  dueDate?: string | null;
  assignedTo?: { _id?: string; id?: string; name?: string; email?: string }[];
};

const endpoint = process.env.NEXT_PUBLIC_MANAGE_WORKS as string;

function parseTaskContent(content: string) {
  const [rawTitle] = String(content || "").split("\n");
  const title = rawTitle?.trim() || "Untitled task";
  return { title };
}

function startOfDayLocal(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildDueMeta(dueDate: string | null | undefined) {
  if (!dueDate) {
    return {
      label: "No due date",
      color: "text-[#908fa0]",
      icon: HiOutlineClock,
      sortKey: Number.POSITIVE_INFINITY,
      urgent: false,
    };
  }

  const parsed = new Date(String(dueDate));
  if (Number.isNaN(parsed.getTime())) {
    return {
      label: "Invalid due date",
      color: "text-[#ffb4ab]",
      icon: HiOutlineExclamation,
      sortKey: Number.POSITIVE_INFINITY,
      urgent: false,
    };
  }

  const today = startOfDayLocal(new Date()).getTime();
  const due = startOfDayLocal(parsed).getTime();
  const deltaDays = Math.round((due - today) / (24 * 60 * 60 * 1000));

  if (deltaDays < 0) {
    return {
      label: `Overdue · ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(parsed)}`,
      color: "text-[#ffb4ab]",
      icon: HiOutlineExclamation,
      sortKey: due,
      urgent: true,
    };
  }
  if (deltaDays === 0) {
    return {
      label: "Due today",
      color: "text-[#ffb783]",
      icon: HiOutlineClock,
      sortKey: due,
      urgent: true,
    };
  }
  if (deltaDays === 1) {
    return {
      label: "Due tomorrow",
      color: "text-[#c0c1ff]",
      icon: HiOutlineClock,
      sortKey: due,
      urgent: true,
    };
  }
  if (deltaDays <= 3) {
    return {
      label: `Due in ${deltaDays} days`,
      color: "text-[#c0c1ff]",
      icon: HiOutlineClock,
      sortKey: due,
      urgent: true,
    };
  }

  return {
    label: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(parsed),
    color: "text-[#908fa0]",
    icon: HiOutlineClock,
    sortKey: Number.POSITIVE_INFINITY,
    urgent: false,
  };
}

export function useDashboardData() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { setWorkspaceData, selectedWorkspace } = useWorkspaceState();
  const [workspaces, setWorkspaces] = useState<IWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingWorkspaceSlug, setDeletingWorkspaceSlug] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [focusTasks, setFocusTasks] = useState<FocusTaskItem[]>([]);
  const [focusBadge, setFocusBadge] = useState("0 URGENT");
  const [focusLoading, setFocusLoading] = useState(false);
  const { isOwnerOrAdmin } = useWorkspaceRole();

  const fetchWorkspaces = useCallback(async (preferredSlug?: string, signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const res = await fetch(endpoint, { signal });
      if (!res.ok) {
        if (!signal?.aborted) {
          setWorkspaces([]);
        }
        return;
      }
      const data: IWorkspace[] = await res.json();
      if (signal?.aborted) return;
      
      setWorkspaces(data);

      const currentSelected = useWorkspaceState.getState().selectedWorkspace;
      const targetSlug =
        preferredSlug ||
        currentSelected?.slug ||
        localStorage.getItem(selectedWorkspaceKey);
      const nextSelected =
        data.find((workspace) => workspace.slug === targetSlug) ||
        data[0] ||
        null;

      setWorkspaceData(data, nextSelected);
      if (nextSelected) {
        localStorage.setItem(selectedWorkspaceKey, nextSelected.slug);
      } else {
        localStorage.removeItem(selectedWorkspaceKey);
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || signal?.aborted) return;
      setWorkspaces([]);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [setWorkspaceData]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      void fetchWorkspaces(undefined, controller.signal);
    });
    return () => controller.abort();
  }, [fetchWorkspaces]);

  useEffect(() => {
    const slug = selectedWorkspace?.slug;
    if (!slug) {
      setFocusTasks([]);
      setFocusBadge("0 URGENT");
      return;
    }

    let ignore = false;

    const loadFocusTasks = async () => {
      setFocusLoading(true);
      try {
        const res = await fetch(
          `/api/tasks?workspaceSlug=${encodeURIComponent(slug)}`,
        );
        if (!res.ok) {
          if (!ignore) {
            setFocusTasks([]);
            setFocusBadge("0 URGENT");
          }
          return;
        }
        const data = (await res.json()) as ApiTask[];
        if (ignore) return;

        const currentUserId = session?.user?.id || "";

        const openTasks = data.filter((t) => t.status !== "done");
        const assignedToMe = currentUserId
          ? openTasks.filter((t) =>
              (t.assignedTo || []).some(
                (u) => (u?._id || u?.id || "") === currentUserId,
              ),
            )
          : [];

        const candidates = (assignedToMe.length ? assignedToMe : openTasks).map(
          (t) => {
            const { title } = parseTaskContent(t.content);
            const due = buildDueMeta(t.dueDate ?? undefined);
            const assignees =
              (t.assignedTo || []).map((u) => ({
                label:
                  (u?.name || u?.email || "U").trim().slice(0, 1).toUpperCase(),
                image: (u as { image?: string } | undefined)?.image || undefined,
              })) || [];

            const shownAssignees =
              assignees.length > 3
                ? [
                    ...assignees.slice(0, 2),
                    { label: `+${assignees.length - 2}` },
                  ]
                : assignees.length
                  ? assignees
                  : [{ label: "U" }];

            return {
              title,
              project: selectedWorkspace?.name || slug,
              due: due.label,
              dueColor: due.color,
              dueIcon: due.icon,
              assignees: shownAssignees,
              _sortKey: due.sortKey,
              _urgent: due.urgent ? 0 : 1,
              _prio: (t.periority || "medium") === "high" ? 0 : 1,
              _hasDue: t.dueDate ? 0 : 1,
            };
          },
        );

        const urgent = candidates
          .filter((t) => t._prio === 0 || t._urgent === 0)
          .sort((a, b) => {
            if (a._prio !== b._prio) return a._prio - b._prio;
            if (a._urgent !== b._urgent) return a._urgent - b._urgent;
            if (a._hasDue !== b._hasDue) return a._hasDue - b._hasDue;
            return a._sortKey - b._sortKey;
          })
          .slice(0, 8)
          .map(
            ({ _sortKey: _a, _prio: _b, _hasDue: _c, _urgent: _d, ...rest }) =>
              rest,
          );

        const todayStart = startOfDayLocal(new Date()).getTime();
        const dueTodayCount = openTasks.filter((t) => {
          if (!t.dueDate) return false;
          const d = new Date(String(t.dueDate));
          if (Number.isNaN(d.getTime())) return false;
          return startOfDayLocal(d).getTime() === todayStart;
        }).length;

        setFocusTasks(urgent);
        setFocusBadge(
          dueTodayCount > 0 ? `${dueTodayCount} DUE TODAY` : `${urgent.length} URGENT`,
        );
      } catch {
        if (!ignore) {
          setFocusTasks([]);
          setFocusBadge("0 URGENT");
        }
      } finally {
        if (!ignore) setFocusLoading(false);
      }
    };

    queueMicrotask(() => void loadFocusTasks());
    return () => {
      ignore = true;
    };
  }, [selectedWorkspace?.slug, selectedWorkspace?.name, session?.user?.id]);

  const handleDeleteWorkspace = async (workspaceSlug: string) => {
    setWorkspaceError("");
    setDeletingWorkspaceSlug(workspaceSlug);
    try {
      const res = await fetch(
        `${endpoint}?workspaceSlug=${encodeURIComponent(workspaceSlug)}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setWorkspaceError(
          typeof data === "string" ? data : "Could not delete workspace.",
        );
        return false;
      }

      const nextWorkspaces = workspaces.filter(
        (workspace) => workspace.slug !== workspaceSlug,
      );
      const currentSelected = useWorkspaceState.getState().selectedWorkspace;
      const nextSelected =
        currentSelected?.slug === workspaceSlug
          ? nextWorkspaces[0] || null
          : nextWorkspaces.find(
              (workspace) => workspace.slug === currentSelected?.slug,
            ) ||
            nextWorkspaces[0] ||
            null;

      setWorkspaces(nextWorkspaces);
      setWorkspaceData(nextWorkspaces, nextSelected);
      if (nextSelected) {
        localStorage.setItem(selectedWorkspaceKey, nextSelected.slug);
      } else {
        localStorage.removeItem(selectedWorkspaceKey);
      }
      return true;
    } catch {
      setWorkspaceError("Something went wrong. Please try again.");
      return false;
    } finally {
      setDeletingWorkspaceSlug("");
    }
  };

  return {
    session,
    workspaces,
    setWorkspaces,
    isLoading,
    deletingWorkspaceSlug,
    workspaceError,
    setWorkspaceError,
    focusTasks,
    focusBadge,
    focusLoading,
    isOwnerOrAdmin,
    fetchWorkspaces,
    handleDeleteWorkspace,
  };
}
