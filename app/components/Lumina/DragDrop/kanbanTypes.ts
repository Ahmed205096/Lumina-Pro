import type { IconType } from "react-icons";

export type KanbanColumnId = "todo" | "in-progress" | "done";

export type TaskPriority = "high" | "medium" | "low" | "complete";

export interface KanbanColumnData {
  id: KanbanColumnId;
  title: string;
  icon: IconType;
}

export interface KanbanAssignee {
  id: string;
  name: string;
  image?: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  periority?: "low" | "medium" | "high";
  dueDate?: string;
  dueLabel?: string;
  assignees: KanbanAssignee[];
  assigneeIds?: string[];
  attachments?: number;
  comments?: number;
  progress?: number;
  isActive?: boolean;
  assignee: string;
  accent: string;
}
