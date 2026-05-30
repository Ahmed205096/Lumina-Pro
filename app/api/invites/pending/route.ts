import User from "@/app/db/models/User";
import Workspace from "@/app/db/models/Workspace";
import dbConnect from "@/app/db/mongoConnection";
import { NextRequest, NextResponse } from "next/server";

// GET: get all pending invites for spesific workspace
export const GET = async (req: NextRequest) => {
  try {
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get("workspaceSlug");
    if (!slug) return NextResponse.json("Slug is required", { status: 400 });
    const workspaceInvitedEmails = await Workspace.findOne({ slug })
      .lean()
      .select({
        invitedEmails: 1,
      });
    if (!workspaceInvitedEmails)
      return NextResponse.json("Not found", { status: 404 });
    return NextResponse.json(workspaceInvitedEmails, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

// PATCH: cancel pending invite for a specific workspace
export const PATCH = async (req: NextRequest) => {
  try {
    const { workspaceSlug, email } = await req.json();

    if (!workspaceSlug || !email) {
      return NextResponse.json("Missing required fields", { status: 400 });
    }

    await dbConnect();

    const workspace = await Workspace.findOneAndUpdate(
      { slug: workspaceSlug },
      {
        $pull: {
          invitedEmails: { email: String(email).trim().toLowerCase() },
        },
      },
      { new: true },
    )
      .lean()
      .select({ invitedEmails: 1 });

    if (!workspace) {
      return NextResponse.json("Not found", { status: 404 });
    }

    return NextResponse.json(workspace, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

// PUT: Remove the user email from pending and add it in members
export const PUT = async (req: NextRequest) => {
  try {
    const { workspaceSlug, email, state } = await req.json();
    if (!workspaceSlug || !email || !state) {
      return NextResponse.json("Missing required fields", { status: 400 });
    }
    await dbConnect();
    const getID = await User.findOne({ email }).lean();
    if (!getID) return NextResponse.json("User not found", { status: 404 });

    const invitedEmail = await Workspace.findOne({
      "invitedEmails.email": email,
    })
      .select({ "invitedEmails.$": 1 })
      .lean();

    if (state === "accepted") {
      const removeFromInviteAddInMembers = await Workspace.findOneAndUpdate(
        {
          slug: workspaceSlug,
          "invitedEmails.email": email,
        },
        {
          $push: {
            members: {
              userId: getID._id,
              role: invitedEmail.invitedEmails?.[0]?.role as string,
            },
          },
          $pull: {
            invitedEmails: { email: email },
          },
        },
        { new: true, runValidators: true },
      );
      return NextResponse.json(removeFromInviteAddInMembers, { status: 200 });
    }
    if (state === "declined") {
      const removeFromInvite = await Workspace.findOneAndUpdate(
        {
          slug: workspaceSlug,
          "invitedEmails.email": email,
        },
        {
          $pull: {
            invitedEmails: { email: email },
          },
        },
        { new: true, runValidators: true },
      );
      return NextResponse.json(removeFromInvite, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};
