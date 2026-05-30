import ActivityLog from "@/app/db/models/ActivityLogs";
import Workspace from "@/app/db/models/Workspace";
import dbConnect from "@/app/db/mongoConnection";
import { auth } from "@/app/utils/auth/auth";
import { NextRequest, NextResponse } from "next/server";

function getId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in (value as Record<string, unknown>)) {
    const id = (value as { _id?: { toString?: () => string } })._id;
    return id?.toString?.() || "";
  }
  return "";
}

// GET: fetch activity logs for a workspace
export const GET = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const workspaceSlug = searchParams.get("workspaceSlug");
    const workspaceId = searchParams.get("workspaceId");
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);
    const skip = Number(searchParams.get("skip") || 0);

    const workspace = workspaceId
      ? await Workspace.findById(workspaceId).select({ ownerId: 1, members: 1 }).lean()
      : workspaceSlug
        ? await Workspace.findOne({ slug: workspaceSlug }).select({ _id: 1, ownerId: 1, members: 1 }).lean()
        : null;

    if (!workspace) {
      return NextResponse.json("Workspace not found", { status: 404 });
    }

    const userId = session.user.id;
    const isOwner = getId(workspace.ownerId) === userId;
    const isMember = workspace.members?.some(
      (m: { userId?: unknown }) => getId(m.userId) === userId,
    );

    if (!isOwner && !isMember) {
      return NextResponse.json("You are not authorized", { status: 403 });
    }

    const logs = await ActivityLog.find({ workspaceId: workspace._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "userId", select: "name image" })
      .lean();

    return NextResponse.json(logs, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};
