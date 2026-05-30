import Workspace from "@/app/db/models/Workspace";
import User from "@/app/db/models/User";
import dbConnect from "@/app/db/mongoConnection";
import { NextResponse, NextRequest } from "next/server";

const workspaceRoles = ["admin", "member", "viewer"];

// GET: Return all members of the current workspace
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const workspaceSlug = searchParams.get("workspaceSlug");

    if (!workspaceSlug) {
      return NextResponse.json("Workspace Slug is required", { status: 400 });
    }

    await dbConnect();

    const workspace = await Workspace.findOne({ slug: workspaceSlug })
      .select({ members: 1, ownerId: 1, name: 1, slug: 1 })
      .populate({ path: "ownerId", select: "name email image phone bio timezone" })
      .populate({ path: "members.userId", select: "name email image phone bio timezone" })
      .lean();
    if (!workspace) {
      return NextResponse.json("Workspace not found", { status: 404 });
    }
    return NextResponse.json(workspace, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

// PATCH: Invite user to the workspace
export const PATCH = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { workspaceSlug, userEmail, userRole } = body;
    if (!workspaceSlug || !userEmail || !userRole) {
      return NextResponse.json("Missing required fields", { status: 400 });
    }

    const normalizedEmail = String(userEmail).trim().toLowerCase();
    const normalizedRole = String(userRole).trim().toLowerCase();

    if (!workspaceRoles.includes(normalizedRole)) {
      return NextResponse.json("Invalid user role", { status: 400 });
    }

    await dbConnect();
    const workspace = await Workspace.findOne({ slug: workspaceSlug });
    if (!workspace) {
      return NextResponse.json("Workspace not found", { status: 404 });
    }

    const invitedEmailExists = workspace.invitedEmails.some(
      (invite: { email: string }) =>
        invite.email.toLowerCase() === normalizedEmail,
    );
    if (invitedEmailExists) {
      return NextResponse.json("Member already invited", { status: 400 });
    }

    const user = await User.findOne({ email: normalizedEmail })
      .select({ _id: 1 })
      .lean();
    const userId = user?._id?.toString();
    const isMemberExists = userId
      ? workspace.members.some(
          (member: { userId?: { toString: () => string } }) =>
            member.userId?.toString() === userId,
        )
      : false;
    const isMemberIsOwner = userId
      ? workspace.ownerId.toString() === userId
      : false;

    if (isMemberExists || isMemberIsOwner) {
      return NextResponse.json("Member already exists", { status: 400 });
    }

    workspace.invitedEmails.push({
      email: normalizedEmail,
      role: normalizedRole,
    });

    await workspace.save();
    return NextResponse.json(workspace, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};
