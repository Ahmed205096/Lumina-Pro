import { useEffect, useMemo, useRef, useState } from "react";
import type { KanbanColumnData, KanbanTask } from "../kanbanTypes";
import {
  type ApiTask,
  type ApiTaskStatus,
  apiStatusToColumnId,
  columnIdToApiStatus,
  safeJson,
  toKanbanTask,
} from "../kanbanHelpers";

export type KanbanState = Record<KanbanColumnData["id"], KanbanTask[]>;

export function useKanbanTasks(selectedWorkspaceSlug?: string) {
  const emptyState = useMemo<KanbanState>(
    () => ({ todo: [], "in-progress": [], done: [] }),
    [],
  );
  const [tasksByColumn, setTasksByColumn] = useState<KanbanState>(emptyState);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const lastPersistRef = useRef<Record<string, { status: ApiTaskStatus; order: number }>>({});
  const lastSyncSignatureRef = useRef<string>("");

  const canUseApi = Boolean(selectedWorkspaceSlug);

  // Initial load
  useEffect(() => {
    if (!canUseApi) {
      queueMicrotask(() => {
        setTasksByColumn(emptyState);
        lastPersistRef.current = {};
        setLoadError("");
        setIsLoading(false);
      });
      return;
    }

    let ignore = false;

    const loadTasks = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const res = await fetch(
          `/api/tasks?workspaceSlug=${encodeURIComponent(selectedWorkspaceSlug as string)}`,
        );

        if (!res.ok) {
          const msg = await safeJson<string>(res);
          throw new Error(typeof msg === "string" ? msg : "Failed to load tasks.");
        }

        const data = (await res.json()) as ApiTask[];
        if (ignore) return;

        const nextState: KanbanState = { todo: [], "in-progress": [], done: [] };
        const nextPersist: Record<string, { status: ApiTaskStatus; order: number }> = {};

        data
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .forEach((task) => {
            const columnId = apiStatusToColumnId(task.status);
            nextState[columnId].push(toKanbanTask(task));
            nextPersist[task._id] = { status: task.status, order: task.order ?? 0 };
          });

        setTasksByColumn(nextState);
        lastPersistRef.current = nextPersist;
        
        // update signature for polling
        lastSyncSignatureRef.current = data
          .slice()
          .sort((a, b) => a._id.localeCompare(b._id))
          .map(
            (task) =>
              `${task._id}:${task.status}:${task.order}:${task.periority || ""}`,
          )
          .join("|");
      } catch (err) {
        if (!ignore) setLoadError((err as Error)?.message || "Failed to load tasks.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    queueMicrotask(() => {
      void loadTasks();
    });

    return () => {
      ignore = true;
    };
  }, [canUseApi, selectedWorkspaceSlug, emptyState]);

  // Polling
  useEffect(() => {
    if (!selectedWorkspaceSlug) return;

    let ignore = false;
    const intervalMs = 15000;

    const tick = async () => {
      if (ignore) return;
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch(
          `/api/tasks?workspaceSlug=${encodeURIComponent(selectedWorkspaceSlug)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;

        const data = (await res.json()) as ApiTask[];

        const signature = data
          .slice()
          .sort((a, b) => a._id.localeCompare(b._id))
          .map(
            (task) =>
              `${task._id}:${task.status}:${task.order}:${task.periority || ""}`,
          )
          .join("|");

        if (signature === lastSyncSignatureRef.current) return;
        lastSyncSignatureRef.current = signature;

        const nextState: KanbanState = { todo: [], "in-progress": [], done: [] };
        const nextPersist: Record<
          string,
          { status: ApiTaskStatus; order: number }
        > = {};

        data
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .forEach((task) => {
            const columnId = apiStatusToColumnId(task.status);
            nextState[columnId].push(toKanbanTask(task));
            nextPersist[task._id] = {
              status: task.status,
              order: task.order ?? 0,
            };
          });

        queueMicrotask(() => {
          setTasksByColumn(nextState);
          lastPersistRef.current = nextPersist;
        });
      } catch {
      }
    };

    const id = setInterval(() => {
      void tick();
    }, intervalMs);

    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, [selectedWorkspaceSlug]);

  const persistColumn = async (columnId: KanbanColumnData["id"], tasks: KanbanTask[]) => {
    if (!canUseApi) return;

    const nextStatus = columnIdToApiStatus[columnId];
    const updates = tasks
      .map((task, index) => {
        const prev = lastPersistRef.current[task.id];
        const nextOrder = index;
        const changed = !prev || prev.status !== nextStatus || prev.order !== nextOrder;
        return { task, index, changed };
      })
      .filter((item) => item.changed);

    if (updates.length === 0) return;

    updates.forEach((item) => {
      lastPersistRef.current[item.task.id] = { status: nextStatus, order: item.index };
    });

    await Promise.all(
      updates.map(async ({ task, index }) => {
        await fetch(`/api/tasks/${encodeURIComponent(task.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus, order: index }),
        }).catch(() => null);
      }),
    );
  };

  const updateColumn = (columnId: KanbanColumnData["id"]) => {
    return (tasks: KanbanTask[]) => {
      setTasksByColumn((current) => ({
        ...current,
        [columnId]: tasks,
      }));
      void persistColumn(columnId, tasks);
    };
  };

  return {
    tasksByColumn,
    setTasksByColumn,
    isLoading,
    loadError,
    updateColumn,
    lastPersistRef
  };
}
