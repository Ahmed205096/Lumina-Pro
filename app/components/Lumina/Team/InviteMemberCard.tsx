"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useWorkspaceState } from "@/store";
import { useWorkspaceRole } from "../hooks/useWorkspaceRole";
import { IoIosArrowDown } from "react-icons/io";
import {
  MdCheckCircle,
  MdErrorOutline,
  MdInfoOutline,
  MdPersonAddAlt1,
  MdSend,
} from "react-icons/md";

const panelClass =
  "rounded-3xl border border-white/8 bg-white/3 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.18)]";

const worksInviteEndpoint = process.env.NEXT_PUBLIC_WORKS_INVITE?.trim() || "";

type InviteStatus =
  | { type: "idle"; message: "" }
  | { type: "found"; message: string }
  | { type: "not-found"; message: string }
  | { type: "error"; message: string };

export default function InviteMemberCard({
  onInviteSent,
}: {
  onInviteSent?: () => void;
}) {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { selectedWorkspace } = useWorkspaceState();
  const userId = session?.user?.id;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [isSending, setIsSending] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>({
    type: "idle",
    message: "",
  });

  const { isOwnerOrAdmin: isAdmin } = useWorkspaceRole();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setInviteStatus({ type: "idle", message: "" });

    if (!selectedWorkspace?.slug) {
      setInviteStatus({
        type: "error",
        message: "Please select a workspace before sending an invite.",
      });
      setIsSending(false);
      return;
    }

    try {
      const inviteResponse = await fetch(worksInviteEndpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceSlug: selectedWorkspace.slug,
          userEmail: email,
          userRole: role.toLowerCase(),
        }),
      });

      if (!inviteResponse.ok) {
        const inviteError = await inviteResponse.json().catch(() => null);

        setInviteStatus({
          type: "error",
          message:
            typeof inviteError === "string"
              ? inviteError
              : "Could not add this person to the workspace invite list.",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SEND_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          type: "WORKSPACE_INVITATION",
          subject: "You are invited to Lumina Pro",
          text: `You have been invited as ${role}.`,
          entityId: selectedWorkspace.slug,
        }),
      });

      if (!response.ok) {
        setInviteStatus({
          type: "error",
          message: "Could not send the invite. Please try again.",
        });
        return;
      }

      const result: { isExists: boolean } = await response.json();

      setInviteStatus(
        result.isExists
          ? {
              type: "found",
              message: "We found this person in our database and invited them.",
            }
          : {
              type: "not-found",
              message:
                "This person is not in our database, but we sent the invite.",
            },
      );

      setEmail("");
      setRole("Member");
      onInviteSent?.();
    } catch (error) {
      console.error("Error sending invite:", error);
      setInviteStatus({
        type: "error",
        message: "Could not send the invite. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      className={`${panelClass} p-6 md:p-8 xl:sticky xl:top-24 overflow-hidden relative`}
    >
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#c1c1f8]/10 blur-3xl" />
      <div className="relative">
        <div className="mb-6 flex items-center gap-3">
          <span
            className={`rounded-lg p-2 ${
              isAdmin ? "bg-[#c1c1f8]/10 text-[#c1c1f8]" : "bg-gray-700/30 text-gray-500"
            }`}
          >
            <MdPersonAddAlt1 size={22} />
          </span>
          <div>
            <h3 className={`text-xl font-bold ${isAdmin ? "" : "text-gray-500"}`}>
              Invite New Member
            </h3>
            {!isAdmin && (
              <p className="mt-1 text-xs text-gray-500">
                Only admins can invite new members
              </p>
            )}
          </div>
        </div>

        <form
          className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_220px] xl:grid-cols-1"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <label
              className="ml-1 text-sm font-medium text-gray-400"
              htmlFor="invite-email"
            >
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="colleague@tasker.pro"
              required
              disabled={!isAdmin}
              className={`h-[52px] w-full rounded-xl border px-4 text-white outline-none duration-200 placeholder:text-gray-500 ${
                isAdmin
                  ? "border-white/10 bg-white/4 focus:border-white/30"
                  : "border-gray-700 bg-gray-900/30 text-gray-500 cursor-not-allowed"
              }`}
            />
          </div>

          <div className="mt-[-10px] space-y-2">
            <label
              className="ml-1 text-sm font-medium text-gray-400"
              htmlFor="invite-role"
            >
              Assign Role
            </label>
            <div className="relative">
              <select
                id="invite-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                disabled={!isAdmin}
                className={`h-[52px] w-full appearance-none rounded-xl border px-4 pr-11 text-white outline-none duration-200 ${
                  isAdmin
                    ? "border-white/10 bg-white/4 focus:border-white/30"
                    : "border-gray-700 bg-gray-900/30 text-gray-500 cursor-not-allowed"
                }`}
              >
                <option className="bg-[#1f1f27]" value="Member">
                  Member
                </option>
                <option className="bg-[#1f1f27]" value="Admin">
                  Admin
                </option>
                <option className="bg-[#1f1f27]" value="Viewer">
                  Viewer
                </option>
              </select>
              <IoIosArrowDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending || !isAdmin}
            className={`flex h-[54px] w-full items-center justify-center gap-2 rounded-xl font-bold duration-200 md:col-span-2 xl:col-span-1 ${
              isAdmin
                ? "bg-[#a6a0f0] text-[#13131b] shadow-lg shadow-[#a6a0f0]/10 hover:bg-[#c1c1f8] active:scale-[0.98]"
                : "bg-gray-700/30 text-gray-500 cursor-not-allowed"
            }`}
          >
            <MdSend size={20} />
            {isSending ? "Sending..." : "Send Invite"}
          </button>
        </form>

        {inviteStatus.type !== "idle" && (
          <div
            className={`mt-5 flex gap-3 rounded-2xl border p-4 text-sm ${
              inviteStatus.type === "error"
                ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
                : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
            }`}
          >
            {inviteStatus.type === "error" ? (
              <MdErrorOutline
                className="mt-0.5 shrink-0 text-rose-300"
                size={20}
              />
            ) : (
              <MdCheckCircle
                className="mt-0.5 shrink-0 text-emerald-300"
                size={20}
              />
            )}
            <p className="leading-6">{inviteStatus.message}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3 rounded-2xl border border-[#42e6f5]/15 bg-[#42e6f5]/8 p-4">
          <MdInfoOutline className="mt-0.5 shrink-0 text-[#42e6f5]" size={20} />
          <p className="text-xs leading-relaxed text-gray-400">
            Invited members will receive a secure link once the invite endpoint
            is connected.
          </p>
        </div>
      </div>
    </section>
  );
}
