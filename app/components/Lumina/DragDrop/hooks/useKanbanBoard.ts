"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KanbanColumnData, KanbanTask } from "../kanbanTypes";
import {
  apiStatusToColumnId,
  columnIdToApiStatus,
  safeJson,
  toKanbanTask,
  type ApiTask,
  type ApiTaskStatus,
  type KanbanState,
} from "../kanbanUtils";

const EMPTY_STATE: KanbanState = { todo: [], "in-progress": [], done: [] };

export function useKanbanBoard({
  selectedWorkspaceSlug,
  isOwnerOrAdmin,
  currentUserId,
}: {
  selectedWorkspaceSlug: string | undefined;
  isOwnerOrAdmin: boolean;
  currentUserId: string;
}) {
  const [tasksByColumn, setTasksByColumn] = useState<KanbanState>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const lastPersistRef = useRef<Record<string, { status: ApiTaskStatus; order: number }>>({});
  const lastSyncSignatureRef = useRef<string>("");

  const canUseApi = Boolean(selectedWorkspaceSlug);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canUseApi) return;
    let ignore = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const res = await fetch(`/api/tasks?workspaceSlug=${encodeURIComponent(selectedWorkspaceSlug!)}`);
        if (!res.ok) {
          const msg = await safeJson<string>(res);
          throw new Error(typeof msg === "string" ? msg : "Failed to load tasks.");
        }
        const data = (await res.json()) as ApiTask[];
        if (ignore) return;
        const next: KanbanState = { ...EMPTY_STATE, todo: [], "in-progress": [], done: [] };
        const persist: Record<string, { status: ApiTaskStatus; order: number }> = {};
        data.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).forEach((t) => {
          next[apiStatusToColumnId(t.status)].push(toKanbanTask(t));
          persist[t._id] = { status: t.status, order: t.order ?? 0 };
        });
        setTasksByColumn(next);
        lastPersistRef.current = persist;
      } catch (err) {
        if (!ignore) setLoadError((err as Error)?.message || "Failed to load tasks.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    queueMicrotask(() => void load());
    return () => { ignore = true; };
  }, [canUseApi, selectedWorkspaceSlug]);

  // ── Polling (15s) ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedWorkspaceSlug) return;
    let ignore = false;

    const tick = async () => {
      if (ignore || (typeof document !== "undefined" && document.hidden)) return;
      try {
        const res = await fetch(`/api/tasks?workspaceSlug=${encodeURIComponent(selectedWorkspaceSlug)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as ApiTask[];
        const sig = data.slice().sort((a, b) => a._id.localeCompare(b._id))
          .map((t) => `${t._id}:${t.status}:${t.order}:${t.periority || ""}`).join("|");
        if (sig === lastSyncSignatureRef.current) return;
        lastSyncSignatureRef.current = sig;
        const next: KanbanState = { todo: [], "in-progress": [], done: [] };
        const persist: Record<string, { status: ApiTaskStatus; order: number }> = {};
        data.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).forEach((t) => {
          next[apiStatusToColumnId(t.status)].push(toKanbanTask(t));
          persist[t._id] = { status: t.status, order: t.order ?? 0 };
        });
        queueMicrotask(() => { setTasksByColumn(next); lastPersistRef.current = persist; });
      } catch { /* silent */ }
    };

    const id = setInterval(() => void tick(), 15000);
    return () => { ignore = true; clearInterval(id); };
  }, [selectedWorkspaceSlug]);

  // ── Reset when no workspace ───────────────────────────────────────────────
  useEffect(() => {
    if (canUseApi) return;
    queueMicrotask(() => {
      setTasksByColumn(EMPTY_STATE);
      lastPersistRef.current = {};
      setLoadError("");
      setIsLoading(false);
    });
  }, [canUseApi]);

  // ── Drag-drop persistence ─────────────────────────────────────────────────
  const persistColumn = useCallback(async (columnId: KanbanColumnData["id"], tasks: KanbanTask[]) => {
    if (!canUseApi) return;
    const nextStatus = columnIdToApiStatus[columnId];
    const updates = tasks
      .map((task, index) => {
        const prev = lastPersistRef.current[task.id];
        const changed = !prev || prev.status !== nextStatus || prev.order !== index;
        return { task, index, changed };
      })
      .filter((u) => u.changed);
    if (!updates.length) return;
    updates.forEach((u) => { lastPersistRef.current[u.task.id] = { status: nextStatus, order: u.index }; });
    await Promise.all(updates.map(({ task, index }) =>
      fetch(`/api/tasks/${encodeURIComponent(task.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, order: index }),
      }).catch(() => null),
    ));
  }, [canUseApi]);

  const updateColumn = useCallback((columnId: KanbanColumnData["id"]) => {
    return (tasks: KanbanTask[]) => {
      const seen = new Set<string>();
      const deduped = tasks.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
      setTasksByColumn((cur) => ({ ...cur, [columnId]: deduped }));
      void persistColumn(columnId, deduped);
    };
  }, [persistColumn]);

  const canDragTask = useCallback((task: KanbanTask) => {
    if (isOwnerOrAdmin) return true;
    if (!currentUserId) return false;
    return Boolean(task.assigneeIds?.includes(currentUserId));
  }, [isOwnerOrAdmin, currentUserId]);

  const todoCount = useMemo(() => tasksByColumn.todo.length, [tasksByColumn.todo]);

  return {
    tasksByColumn,
    setTasksByColumn,
    lastPersistRef,
    isLoading,
    loadError,
    todoCount,
    updateColumn,
    canDragTask,
  };
}
