import { MdClose, MdRefresh } from "react-icons/md";
import type { PendingInvite, TeamRole } from "./teamData";

const panelClass =
  "rounded-3xl border border-white/8 bg-white/3 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.18)]";

const roleStyles: Record<TeamRole, string> = {
  Admin: "border-[#c1c1f8]/20 bg-[#c1c1f8]/10 text-[#c1c1f8]",
  Member: "border-[#42e6f5]/20 bg-[#42e6f5]/10 text-[#42e6f5]",
  Viewer: "border-orange-300/20 bg-orange-300/10 text-orange-200",
};

function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}

export default function PendingInvitesTable({
  invites,
  isLoading = false,
  onCancelInvite,
  onRefreshInvites,
  isAdmin = false,
}: {
  invites: PendingInvite[];
  isLoading?: boolean;
  onCancelInvite?: (email: string) => void;
  onRefreshInvites?: () => void;
  isAdmin?: boolean;
}) {
  return (
    <section
      className={`${panelClass} overflow-hidden border-dashed border-[#c1c1f8]/25`}
    >
      <div className="flex flex-col gap-3 border-b border-white/6 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold sm:text-xl">Pending Invites</h3>
          <span className="rounded-full bg-orange-300/10 px-3 py-1 text-xs font-semibold text-orange-200">
            {isLoading ? "Loading" : `${invites.length} Waiting`}
          </span>
        </div>
      </div>

      <div className="divide-y divide-white/6 xl:hidden">
        {!isLoading && invites.length === 0 && (
          <p className="p-4 text-sm text-gray-400 sm:px-6">
            No pending invites.
          </p>
        )}
        {invites.map((invite) => (
          <div className="p-4 sm:px-6 sm:py-5" key={invite.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 break-all font-semibold text-white">
                {invite.email}
              </p>
              <div className="flex items-center justify-between gap-3 sm:shrink-0">
                <RoleBadge role={invite.role} />
                <div className="flex gap-2">
                  <button
                    className="rounded-lg p-2 text-gray-400 duration-200 hover:bg-[#c1c1f8]/10 hover:text-[#c1c1f8] disabled:cursor-not-allowed disabled:opacity-50"
                    title="Resend Invite"
                    type="button"
                    onClick={onRefreshInvites}
                    disabled={isLoading}
                  >
                    <MdRefresh
                      className={isLoading ? "animate-spin" : ""}
                      size={21}
                    />
                  </button>
                  <button
                    disabled={!isAdmin}
                    className={`rounded-lg p-2 duration-200 ${
                      isAdmin
                        ? "text-gray-400 hover:bg-rose-400/10 hover:text-rose-300 cursor-pointer"
                        : "text-gray-600 cursor-not-allowed opacity-50"
                    }`}
                    title={
                      isAdmin
                        ? "Cancel Invite"
                        : "Only admins can cancel invites"
                    }
                    type="button"
                    onClick={() => onCancelInvite?.(invite.email)}
                  >
                    <MdClose size={21} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden xl:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-sm text-gray-400">
              <th className="px-6 py-4 font-semibold">Email Address</th>
              <th className="px-6 py-4 font-semibold">Invited As</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {!isLoading && invites.length === 0 && (
              <tr>
                <td className="px-6 py-5 text-sm text-gray-400" colSpan={2}>
                  No pending invites.
                </td>
              </tr>
            )}
            {invites.map((invite) => (
              <tr className="duration-200 hover:bg-white/3" key={invite.id}>
                <td className="px-6 py-5">
                  <p className="font-semibold text-white">{invite.email}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <RoleBadge role={invite.role} />
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg p-2 text-gray-400 duration-200 hover:bg-[#c1c1f8]/10 hover:text-[#c1c1f8] disabled:cursor-not-allowed disabled:opacity-50"
                        title="Resend Invite"
                        type="button"
                        onClick={onRefreshInvites}
                        disabled={isLoading}
                      >
                        <MdRefresh
                          className={isLoading ? "animate-spin" : ""}
                          size={21}
                        />
                      </button>
                      <button
                        disabled={!isAdmin}
                        className={`rounded-lg p-2 duration-200 ${
                          isAdmin
                            ? "text-gray-400 hover:bg-rose-400/10 hover:text-rose-300 cursor-pointer"
                            : "text-gray-600 cursor-not-allowed opacity-50"
                        }`}
                        title={
                          isAdmin
                            ? "Cancel Invite"
                            : "Only admins can cancel invites"
                        }
                        type="button"
                        onClick={() => onCancelInvite?.(invite.email)}
                      >
                        <MdClose size={21} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
