import ActivityLog from "@/app/db/models/ActivityLogs";
import Notification from "@/app/db/models/Notification";
import Task from "@/app/db/models/Task";
import User from "@/app/db/models/User";
import Workspace from "@/app/db/models/Workspace";
import dbConnect from "@/app/db/mongoConnection";
import { auth } from "@/app/utils/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_RESEND_SECRET);

function extractTitle(content: string): string {
  return (
    String(content || "")
      .split("\n")[0]
      ?.trim() || "Untitled task"
  );
}

function getId(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    "_id" in (value as Record<string, unknown>)
  ) {
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
  const raw = String(value || "medium")
    .trim()
    .toLowerCase();
  if (raw === "low" || raw === "high") return raw;
  return "medium";
}

function getAssignableUserIds(workspace: {
  ownerId?: unknown;
  members?: { userId?: unknown }[];
}) {
  const ids = new Set<string>();
  const ownerId = getId(workspace.ownerId);
  if (ownerId) ids.add(ownerId);
  workspace.members?.forEach((member) => {
    const id = getId(member.userId);
    if (id) ids.add(id);
  });
  return ids;
}

async function getAuthorizedWorkspaceData(
  params: URLSearchParams,
  userId: string,
) {
  const workspaceId = params.get("workspaceId");
  const workspaceSlug = params.get("workspaceSlug") || params.get("slug");

  const workspace = workspaceId
    ? await Workspace.findById(workspaceId)
        .select({ ownerId: 1, members: 1 })
        .lean()
    : workspaceSlug
      ? await Workspace.findOne({ slug: workspaceSlug })
          .select({ _id: 1, ownerId: 1, members: 1 })
          .lean()
      : null;

  if (!workspace) return { error: "Workspace not found", status: 404 } as const;

  const ownerId = getId(workspace.ownerId);
  const memberEntry = workspace.members?.find(
    (member: { userId?: unknown; role?: string }) =>
      getId(member.userId) === userId,
  );
  const isOwner = ownerId === userId;
  const isMember = Boolean(memberEntry);
  const isAdmin = memberEntry?.role?.toLowerCase?.() === "admin";

  if (!isOwner && !isMember) {
    return { error: "You are not authorized", status: 403 } as const;
  }

  return {
    workspaceId: workspace._id.toString(),
    isOwner,
    isAdmin,
    assignableUserIds: getAssignableUserIds(workspace),
  } as const;
}

async function getAuthorizedWorkspaceId(
  params: URLSearchParams,
  userId: string,
) {
  const authorized = await getAuthorizedWorkspaceData(params, userId);
  if ("error" in authorized) return authorized;
  return { workspaceId: authorized.workspaceId } as const;
}

// GET: list tasks for a workspace
export const GET = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const authorized = await getAuthorizedWorkspaceId(
      searchParams,
      session.user.id,
    );

    if ("error" in authorized) {
      return NextResponse.json(authorized.error, { status: authorized.status });
    }

    const status = searchParams.get("status");
    const query: Record<string, unknown> = {
      workspaceId: authorized.workspaceId,
    };
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .sort({ status: 1, order: 1, createdAt: 1 })
      .select(
        "content periority status order workspaceId assignedTo dueDate createdAt",
      )
      .populate({ path: "assignedTo", select: "name email image" })
      .lean();

    return NextResponse.json(tasks, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

// POST: create task in a workspace
export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      content,
      periority,
      status = "todo",
      order = 0,
      workspaceId,
      workspaceSlug,
      assignedTo,
      dueDate,
    } = body;

    if (!content) {
      return NextResponse.json("Task content is required", { status: 400 });
    }

    await dbConnect();

    const params = new URLSearchParams();
    if (workspaceId) params.set("workspaceId", String(workspaceId));
    if (workspaceSlug) params.set("workspaceSlug", String(workspaceSlug));

    const authorized = await getAuthorizedWorkspaceData(
      params,
      session.user.id,
    );
    if ("error" in authorized) {
      return NextResponse.json(authorized.error, { status: authorized.status });
    }

    const requestedAssignees = normalizeObjectIdList(assignedTo);
    const requestedDueDate = parseDueDate(dueDate);
    const requestedPeriority = normalizePeriority(periority);

    const isDistributing =
      requestedAssignees.length > 0 || typeof dueDate !== "undefined";

    if (isDistributing && !(authorized.isOwner || authorized.isAdmin)) {
      return NextResponse.json(
        "Only the workspace owner/admin can assign tasks or set due dates",
        { status: 403 },
      );
    }

    const invalidAssignee = requestedAssignees.find(
      (id) => !authorized.assignableUserIds.has(id),
    );
    if (invalidAssignee) {
      return NextResponse.json("Assignee must be a workspace member", {
        status: 400,
      });
    }

    if (requestedDueDate === undefined && dueDate) {
      return NextResponse.json("Invalid due date", { status: 400 });
    }
    if (requestedDueDate instanceof Date && isPastDueDate(requestedDueDate)) {
      return NextResponse.json("Due date cannot be in the past", {
        status: 400,
      });
    }

    const task = await Task.create({
      content: String(content),
      status,
      order: Number(order) || 0,
      periority: requestedPeriority,
      workspaceId: authorized.workspaceId,
      assignedTo: requestedAssignees,
      dueDate: requestedDueDate === null ? null : requestedDueDate,
    });

    await ActivityLog.create({
      workspaceId: authorized.workspaceId,
      taskId: task._id,
      taskContent: extractTitle(String(content)),
      userId: session.user.id,
      actionType: "CREATE",
    });

    if (requestedAssignees.length > 0) {
      const taskTitle = extractTitle(String(content));
      const priorityLabel =
        requestedPeriority.charAt(0).toUpperCase() +
        requestedPeriority.slice(1);
      const dueLine =
        requestedDueDate instanceof Date
          ? `Due: ${requestedDueDate.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}`
          : null;
      const senderName =
        String(session.user.name || "").trim() ||
        String(session.user.email || "").trim() ||
        "A teammate";

      const baseUrl = (
        process.env.NEXT_PUBLIC_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000"
      ).replace(/\/+$/, "");

      const assigneeUsers = await User.find({
        _id: { $in: requestedAssignees },
      })
        .select("_id name email")
        .lean();

      await Promise.allSettled(
        assigneeUsers.map(async (user) => {
          const message = `${senderName} assigned you to "${taskTitle}". Priority: ${priorityLabel}.${dueLine ? ` ${dueLine}.` : ""}`;
          const emailSubject = `New task assigned: ${taskTitle}`;

          await Notification.create({
            recipientId: user._id,
            senderId: session?.user?.id,
            type: "TASK_ASSIGNED",
            title: emailSubject,
            message,
            entityId: String(task._id),
            onModel: "Task",
          });

          const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:24px auto;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:22px 18px;color:#fff;">
    <div style="font-size:13px;opacity:.9;font-weight:600;">Lumina Pro</div>
    <div style="margin-top:6px;font-size:21px;font-weight:800;line-height:1.2;">${emailSubject}</div>
  </div>
  <div style="padding:20px 18px;color:#111827;">
    <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#374151;">
      <strong>${senderName}</strong> assigned you to a new task.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:13px;">
      <tr><td style="padding:8px 12px;background:#f9fafb;border-radius:8px 8px 0 0;color:#6b7280;font-weight:600;width:110px;">Task</td><td style="padding:8px 12px;background:#f9fafb;border-radius:0 8px 0 0;color:#111827;font-weight:700;">${taskTitle}</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;color:#6b7280;font-weight:600;">Priority</td><td style="padding:8px 12px;background:#f3f4f6;color:#111827;">${priorityLabel}</td></tr>
      ${dueLine ? `<tr><td style="padding:8px 12px;background:#f9fafb;border-radius:0 0 0 8px;color:#6b7280;font-weight:600;">Due date</td><td style="padding:8px 12px;background:#f9fafb;border-radius:0 0 8px 0;color:#111827;">${requestedDueDate instanceof Date ? requestedDueDate.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" }) : ""}</td></tr>` : ""}
    </table>
    <div style="margin-top:18px;text-align:center;">
      <a href="${baseUrl}/work-board" style="display:inline-block;padding:12px 20px;background:#111827;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">View Task Board</a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:12px 18px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">Sent by Lumina Pro</div>
</div>`;

          await resend.emails.send({
            to: String(user.email),
            from: "Lumina Pro <onboarding@resend.dev>",
            subject: emailSubject,
            html,
          });
        }),
      );
    }

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};
