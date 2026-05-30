import Notification from "@/app/db/models/Notification";
import dbConnect from "@/app/db/mongoConnection";
import { auth } from "@/app/utils/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const session = await auth();
    const { recipientId, type, title, message, entityId, onModel } = body;
    if (!recipientId || !session?.user?.id || !type || !title || !onModel) {
      return NextResponse.json("Bad Request", { status: 400 });
    }
    await dbConnect();
    const notification = await Notification.create({
      recipientId,
      senderId: session.user.id,
      type,
      title,
      message,
      entityId,
      onModel,
    });
    return NextResponse.json(notification, { status: 201 });
  } catch (err) {
    console.log("NOTIFICATION ERROR", err);

    return NextResponse.json(err, { status: 500 });
  }
};

export const GET = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const userEmail = String(session.user.email || "").trim().toLowerCase();

    // If the user was invited before they had an account, notifications may be
    // stored against their email. Attach them to the newly created userId.
    if (userEmail) {
      await Notification.updateMany(
        {
          recipientEmail: userEmail,
          $or: [{ recipientId: { $exists: false } }, { recipientId: null }],
        },
        { $set: { recipientId: userId }, $unset: { recipientEmail: 1 } },
      ).catch(() => null);
    }

    const notifications = await Notification.find({
      recipientId: userId,
    })
      .populate("senderId", "name email image")
      .lean();
    return NextResponse.json(notifications, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

// PATCH: set the notification readed
export const PATCH = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const session = await auth();
    const { id } = body;
    if (!id || !session?.user?.id) {
      return NextResponse.json("Bad Request", { status: 400 });
    }
    await dbConnect();
    const notification = await Notification.findOneAndUpdate(
      { _id: id },
      { isRead: true },
      { new: true },
    );
    return NextResponse.json(notification, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};
