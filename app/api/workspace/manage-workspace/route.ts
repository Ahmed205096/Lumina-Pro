import Workspace from "@/app/db/models/Workspace";
import dbConnect from "@/app/db/mongoConnection";
import { auth } from "@/app/utils/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

// POST: Add workspace
export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }
    const ownerId = session.user.id;
    const { name, slug, description, members, invitedEmails } =
      await req.json();
    await dbConnect();
    if (!name || !slug) {
      return NextResponse.json("Please fill all the required fields", {
        status: 400,
      });
    }
    const isWorkspaceNameExist = await Workspace.findOne({
      name,
    });
    if (isWorkspaceNameExist) {
      return NextResponse.json("Workspace name already exists", {
        status: 400,
      });
    }

    const isWorkspaceSlugExist = await Workspace.findOne({
      slug: slug.toLowerCase(),
    });
    if (isWorkspaceSlugExist) {
      return NextResponse.json("Workspace slug already exists", {
        status: 400,
      });
    }

    await Workspace.create({
      name,
      slug,
      description,
      ownerId,
      members,
      invitedEmails,
    });
    return NextResponse.json("Workspace created successfully", { status: 201 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

// GET: get workspace for a user
export const GET = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }
    const userId = new mongoose.Types.ObjectId(session.user.id);
    await dbConnect();
    const workspace = await Workspace.find({
      $or: [{ ownerId: userId }, { "members.userId": userId }],
    });
    return NextResponse.json(workspace, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

// PATCH: delete specific user in workspace
export const PATCH = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }
    const requesterId = session.user.id;

    const body = await req.json();
    const { userId, workspaceSlug } = body;
    if (!userId || !workspaceSlug) {
      return NextResponse.json("Please provide all the required fields", {
        status: 400,
      });
    }
    await dbConnect();

    const workspaceInfo = await Workspace.findOne({ slug: workspaceSlug })
      .select({ ownerId: 1, members: 1 })
      .lean();

    if (!workspaceInfo) {
      return NextResponse.json("Workspace not found", { status: 404 });
    }

    if (workspaceInfo.ownerId.toString() === userId) {
      return NextResponse.json("Workspace owner cannot be removed", {
        status: 400,
      });
    }

    const isRequesterOwner = workspaceInfo.ownerId.toString() === requesterId;
    const isRequesterAdmin = workspaceInfo.members.some(
      (member: { userId: { toString: () => string }; role: string }) =>
        member.userId.toString() === requesterId && member.role === "admin",
    );

    if (!isRequesterOwner && !isRequesterAdmin) {
      return NextResponse.json("You are not authorized", { status: 403 });
    }

    const workspace = await Workspace.findOneAndUpdate(
      { slug: workspaceSlug, "members.userId": userId },
      { $pull: { members: { userId } } },
      { new: true },
    );

    if (!workspace) {
      return NextResponse.json("Member not found", { status: 404 });
    }

    return NextResponse.json(workspace, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

// DELETE: remove the workspace
export const DELETE = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json("You are not authenticated", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const body = await req.json().catch(() => ({}));
    const workspaceSlug =
      searchParams.get("workspaceSlug") ||
      searchParams.get("slug") ||
      body.workspaceSlug ||
      body.slug;

    if (!workspaceSlug) {
      return NextResponse.json("Workspace slug is required", { status: 400 });
    }

    await dbConnect();

    const workspace = await Workspace.findOne({ slug: workspaceSlug }).select({
      ownerId: 1,
    });

    if (!workspace) {
      return NextResponse.json("Workspace not found", { status: 404 });
    }

    if (workspace.ownerId.toString() !== session.user.id) {
      return NextResponse.json("Only the workspace owner can delete it", {
        status: 403,
      });
    }

    const deletedWorkspace = await Workspace.findOneAndDelete({
      slug: workspaceSlug,
    });

    if (!deletedWorkspace) {
      return NextResponse.json("Workspace not found", { status: 404 });
    }

    return NextResponse.json(deletedWorkspace, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};
