import type { KanbanColumnData, KanbanTask } from "./kanbanTypes";

export type ApiTaskStatus = "todo" | "inProgress" | "done";

export type ApiTask = {
  _id: string;
  content: string;
  periority?: "low" | "medium" | "high";
  status: ApiTaskStatus;
  order: number;
  dueDate?: string;
  assignedTo?: { _id?: string; id?: string; name?: string; email?: string; image?: string }[];
};

export const columnIdToApiStatus: Record<KanbanColumnData["id"], ApiTaskStatus> = {
  todo: "todo",
  "in-progress": "inProgress",
  done: "done",
};

export const apiStatusToColumnId = (status: ApiTaskStatus): KanbanColumnData["id"] => {
  if (status === "inProgress") return "in-progress";
  if (status === "done") return "done";
  return "todo";
};

export function parseTaskContent(content: string) {
  const [rawTitle, ...rest] = String(content || "").split("\n");
  const title = rawTitle?.trim() || "Untitled task";
  const description = rest.join("\n").trim() || "No description.";
  return { title, description };
}

export function serializeTaskContent(title: string, description: string) {
  const cleanTitle = title.trim();
  const cleanDescription = description.trim();
  return cleanDescription ? `${cleanTitle}\n${cleanDescription}` : cleanTitle;
}

const accentPalette = [
  "bg-rose-400",
  "bg-amber-300",
  "bg-cyan-300",
  "bg-indigo-300",
  "bg-emerald-300",
  "bg-violet-300",
];

export function stableAccent(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return accentPalette[hash % accentPalette.length];
}

export function toLocalDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toKanbanTask(apiTask: ApiTask): KanbanTask {
  const { title, description } = parseTaskContent(apiTask.content);
  const dueLabel = apiTask.dueDate
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
        new Date(apiTask.dueDate),
      )
    : undefined;

  const rawPeriority = apiTask.periority || "medium";

  const assignees = (apiTask.assignedTo ?? [])
    .map((u) => ({
      id: (u._id || u.id || "").toString(),
      name: u.name || u.email || "Unknown",
      image: u.image,
    }))
    .filter((u) => u.id);

  return {
    id: apiTask._id,
    title,
    description,
    priority: apiTask.status === "done" ? "complete" : rawPeriority,
    periority: rawPeriority,
    dueDate: apiTask.dueDate,
    dueLabel,
    assignees,
    assigneeIds: assignees.map((u) => u.id),
    assignee:
      apiTask.assignedTo?.[0]?.name?.trim?.().slice(0, 1).toUpperCase() ||
      apiTask.assignedTo?.[0]?.email?.trim?.().slice(0, 1).toUpperCase() ||
      "U",
    accent: stableAccent(apiTask._id),
  };
}

export async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
