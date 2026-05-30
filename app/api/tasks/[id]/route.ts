import ActivityLog from "@/app/db/models/ActivityLogs";
import Task from "@/app/db/models/Task";
import Workspace from "@/app/db/models/Workspace";
import dbConnect from "@/app/db/mongoConnection";
import { auth } from "@/app/utils/auth/auth";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

function extractTitle(content: string): string {
  return String(content || "").split("\n")[0]?.trim() || "Untitled task";
}

function isValidObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value);
}

function getId(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in (value as Record<string, unknown>)) {
    const id = (value as { _id?: { toString?: () => string } })._id;
    return id?.toString?.() || "";
  }
  return "";
}

function normalizeObjectIdList(value: unknown) {
  if (!Array.isArray(value)) return [];
  const unique = new Set<string>();
  value.forEach((item) => {
    if (typeof item === "string" && item.trim()) unique.add(item.trim());
  });
  return Array.from(unique);
}

function parseDueDate(value: unknown) {
  if (value === null) return null;
  if (!value) return undefined;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function getTodayStartUtcMs() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function isPastDueDate(date: Date) {
  return date.getTime() < getTodayStartUtcMs();
}

function normalizePeriority(value: unknown) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return undefined;
  if (raw === "low" || raw === "medium" || raw === "high") return raw;
  return undefined;
}

function getAssignableUserIds(workspace: { ownerId?: unknown; members?: { userId?: unknown }[] }) {
  const ids = new Set<string>();
  const ownerId = getId(workspace.ownerId);
  if (ownerId) ids.add(ownerId);
  workspace.members?.forEach((member) => {
    const id = getId(member.userId);
    if (id) ids.add(id);
  });
  return ids;
}

async function getAuthorizedTask(
  taskId: string,
  userId: string,
  mode: "readWrite" | "delete" = "readWrite",
) {
  if (!isValidObjectId(taskId)) {
    return { error: "Invalid task id", status: 400 } as const;
  }

  const task = await Task.findById(taskId).lean();
  if (!task) return { error: "Task not found", status: 404 } as const;

  const workspace = await Workspace.findById(task.workspaceId)
    .select({ ownerId: 1, members: 1 })
    .lean();

  if (!workspace) {
    return { error: "Workspace not found", status: 404 } as const;
  }

  const isOwner = workspace.ownerId?.toString?.() === userId;
  const memberEntry = workspace.members?.find(
    (member: { userId?: { toString: () => string }; role?: string }) =>
      member.userId?.toString() === userId,
  );
  const isMember = Boolean(memberEntry);
  const isAdmin = memberEntry?.role?.toLowerCase?.() === "admin";

  if (!isOwner && !isMember) {
    return { error: "You are not authorized", status: 403 } as const;
  }

  if (mode === "delete" && !isOwner && !isAdmin) {
    return { error: "You are not authorized", status: 403 } as const;
  }

  return { task, workspace, isOwner, isAdmin } as const;
}

// GET: get task by id
export const GET = async (_req: NextRequest, ctx: RouteContext<"/api/tasks/[id]">) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }

    await dbConnect();

    const { id } = await ctx.params;
    const authorized = await getAuthorizedTask(id, session.user.id, "readWrite");
    if ("error" in authorized) {
      return NextResponse.json(authorized.error, { status: authorized.status });
    }

    return NextResponse.json(authorized.task, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

// PATCH: update task
export const PATCH = async (req: NextRequest, ctx: RouteContext<"/api/tasks/[id]">) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { content, status, order, assignedTo, dueDate, periority } = body;

    await dbConnect();

    const { id } = await ctx.params;
    const authorized = await getAuthorizedTask(id, session.user.id, "readWrite");
    if ("error" in authorized) {
      return NextResponse.json(authorized.error, { status: authorized.status });
    }

    const update: Record<string, unknown> = {};
    if (typeof content === "string") update.content = content;
    if (typeof status === "string") update.status = status;
    if (typeof order === "number") update.order = order;

    const requestedPeriority = normalizePeriority(periority);
    if (requestedPeriority) update.periority = requestedPeriority;
    if (typeof periority !== "undefined" && !requestedPeriority) {
      return NextResponse.json("Invalid periority", { status: 400 });
    }

    const requestedAssignees = normalizeObjectIdList(assignedTo);
    const requestedDueDate = parseDueDate(dueDate);
    const wantsDistribution =
      Array.isArray(assignedTo) || typeof dueDate !== "undefined";

    if (wantsDistribution && !(authorized.isOwner || authorized.isAdmin)) {
      return NextResponse.json(
        "Only the workspace owner/admin can assign tasks or set due dates",
        { status: 403 },
      );
    }

    if (Array.isArray(assignedTo)) {
      const assignableIds = getAssignableUserIds(authorized.workspace);
      const invalidAssignee = requestedAssignees.find((id) => !assignableIds.has(id));
      if (invalidAssignee) {
        return NextResponse.json("Assignee must be a workspace member", {
          status: 400,
        });
      }
      update.assignedTo = requestedAssignees;
    }

    if (requestedDueDate === undefined && dueDate) {
      return NextResponse.json("Invalid due date", { status: 400 });
    }
    if (requestedDueDate instanceof Date && isPastDueDate(requestedDueDate)) {
      return NextResponse.json("Due date cannot be in the past", { status: 400 });
    }
    if (requestedDueDate === null) update.dueDate = null;
    if (requestedDueDate) update.dueDate = requestedDueDate;

    const nextTask = await Task.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    const oldStatus = authorized.task.status as string;
    const newStatus = typeof status === "string" ? status : oldStatus;
    const oldContent = authorized.task.content as string;
    const newContent = typeof content === "string" ? content : oldContent;

    let actionType: string | null = null;
    let details: Record<string, string> = {};

    if (newStatus !== oldStatus) {
      if (newStatus === "done") {
        actionType = "COMPLETE";
      } else if (oldStatus === "done") {
        actionType = "INCOMPLETE";
      } else {
        actionType = "MOVE_STATUS";
        details = { fromStatus: oldStatus, toStatus: newStatus };
      }
    } else if (newContent !== oldContent) {
      actionType = "UPDATE_CONTENT";
      details = { oldContent: extractTitle(oldContent), newContent: extractTitle(newContent) };
    }

    if (actionType) {
      await ActivityLog.create({
        workspaceId: authorized.task.workspaceId,
        taskId: authorized.task._id,
        taskContent: extractTitle(newContent),
        userId: session.user.id,
        actionType,
        details,
      });
    }

    return NextResponse.json(nextTask, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

// DELETE: delete task (owner/admin only)
export const DELETE = async (_req: NextRequest, ctx: RouteContext<"/api/tasks/[id]">) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }

    await dbConnect();

    const { id } = await ctx.params;
    const authorized = await getAuthorizedTask(id, session.user.id, "delete");
    if ("error" in authorized) {
      return NextResponse.json(authorized.error, { status: authorized.status });
    }

    const deleted = await Task.findByIdAndDelete(id).lean();

    await ActivityLog.create({
      workspaceId: authorized.task.workspaceId,
      taskId: authorized.task._id,
      taskContent: extractTitle(authorized.task.content as string),
      userId: session.user.id,
      actionType: "DELETE",
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};
