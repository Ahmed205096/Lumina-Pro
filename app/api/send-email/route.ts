import { checkExists } from "@/app/actions/checkExists/checkExists";
import Email from "@/app/db/models/Email";
import Notification from "@/app/db/models/Notification";
import User from "@/app/db/models/User";
import Workspace from "@/app/db/models/Workspace";
import dbConnect from "@/app/db/mongoConnection";
import { auth } from "@/app/utils/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_RESEND_SECRET);
const resendFromEmail =
  "Lumina Pro <noreply@lumina.ahmed-khattab.online>";

type NotificationType =
  | "WORKSPACE_INVITATION"
  | "TASK_ASSIGNED"
  | "TASK_COMMENT"
  | "WORKSPACE_ROLE_CHANGE";

interface IBody {
  to: string;
  subject: string;
  text: string;
  type: NotificationType;
  entityId: string;
}

export const POST = async (request: NextRequest) => {
  try {
    const body: IBody = await request.json();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
    }

    // if (session?.user.email === body.to) {
    //   return NextResponse.json(
    //     { err: "You cannot invite yourself." },
    //     { status: 400 },
    //   );
    // }
    if (
      !body.to ||
      !body.subject ||
      !body.text ||
      !body.type ||
      !body.entityId
    ) {
      return NextResponse.json(
        { err: "All fields are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const baseUrl =
      (process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || "").trim() ||
      "http://lumina.ahmed-khattab.online";

    const inviterName =
      String(session.user.name || "").trim() ||
      String(session.user.email || "").trim() ||
      "A teammate";

    let workspaceName = "";
    if (body.type === "WORKSPACE_INVITATION" && body.entityId) {
      const workspace = await Workspace.findOne({ slug: body.entityId })
        .select({ name: 1 })
        .lean();
      workspaceName = String(workspace?.name || "").trim();
    }

    const inviteRoleMatch = /invited as\s+([a-z]+)/i.exec(body.text || "");
    const inviteRole =
      (inviteRoleMatch?.[1] || "").trim().toLowerCase() || "";

    const ctaHref = `${baseUrl.replace(/\/+$/, "")}/login`;

    const subject =
      body.type === "WORKSPACE_INVITATION" && workspaceName
        ? `You're invited to ${workspaceName} on Lumina Pro`
        : body.subject;

    const html = `<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 24px auto; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; background: #ffffff;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 22px 18px; color: #ffffff; text-align: left;">
    <div style="font-size: 14px; opacity: 0.9; font-weight: 600; letter-spacing: 0.3px;">Lumina Pro</div>
    <div style="margin-top: 6px; font-size: 22px; font-weight: 800; line-height: 1.15;">${subject}</div>
  </div>

  <div style="padding: 20px 18px; color: #111827;">
    ${
      body.type === "WORKSPACE_INVITATION"
        ? `<p style="margin: 0 0 12px; font-size: 14px; line-height: 1.7; color: #374151;">
            <strong>${inviterName}</strong> invited you to join <strong>${workspaceName || body.entityId}</strong>${
              inviteRole ? ` as <strong>${inviteRole}</strong>` : ""
            }.
          </p>
          <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.7; color: #374151;">
            Use this email address (<strong>${body.to}</strong>) to sign up or log in, then open Notifications to accept or decline the invitation.
          </p>`
        : `<p style="margin: 0 0 14px; font-size: 14px; line-height: 1.7; color: #374151;">${body.text}</p>`
    }

    <div style="margin-top: 16px; text-align: center;">
      <a href="${ctaHref}" style="display: inline-block; padding: 12px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
        Open Lumina Pro
      </a>
    </div>

    <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280; line-height: 1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <span style="color: #374151;">${ctaHref}</span>
    </p>
  </div>

  <div style="background: #f9fafb; padding: 14px 18px; text-align: left; border-top: 1px solid #e5e7eb;">
    <div style="font-size: 12px; color: #9ca3af;">Sent by Lumina Pro</div>
  </div>
</div>`;

    const email_content = {
      to: body.to,
      from: resendFromEmail,
      subject,
      html,
    };
    const isExists = await checkExists(body.to);

    const recipient = await User.findOne({
      email: body.to.trim().toLowerCase(),
    })
      .select({ _id: 1 })
      .lean();

    const { data, error } = await resend.emails.send(email_content);

    if (error) {
      return NextResponse.json(error, { status: 500 });
    }

    const onModel =
      body.type === "WORKSPACE_INVITATION"
        ? "Workspace"
        : body.type === "WORKSPACE_ROLE_CHANGE"
          ? "Board"
          : "Task";

    // Create a notification for both existing and not-yet-registered users.
    // Omit recipientId entirely when unknown to avoid schema validator drift.
    await Notification.create({
      ...(recipient?._id ? { recipientId: recipient._id } : {}),
      ...(recipient?._id
        ? {}
        : { recipientEmail: body.to.trim().toLowerCase() }),
      senderId: session.user.id,
      type: body.type,
      title: subject,
      message:
        body.type === "WORKSPACE_INVITATION"
          ? `${inviterName} invited you to ${workspaceName || body.entityId}${
              inviteRole ? ` as ${inviteRole}` : ""
            }.`
          : body.text,
      entityId: body.entityId,
      onModel,
    });

    await Email.create(email_content);
    return NextResponse.json({ data, isExists }, { status: 200 });
  } catch (err) {
    console.log("ERROR", err);

    return NextResponse.json(err, { status: 500 });
  }
};
