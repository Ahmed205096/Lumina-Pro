import { MdPersonRemove } from "react-icons/md";
import type { TeamMember, TeamRole } from "./teamData";
import { useEffect, useMemo, useState } from "react";

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

function MemberAvatar({
  initials,
  image,
  name,
}: {
  initials: string;
  image?: string;
  name: string;
}) {
  return (
    <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-linear-to-br from-[#a6a0f0]/35 to-[#42e6f5]/15 text-sm font-bold text-white">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={name}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          src={image}
        />
      ) : (
        initials
      )}
    </div>
  );
}

function formatTimeInZone(now: Date, timeZone?: string) {
  if (!timeZone) return "";
  try {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }).format(now);
  } catch {
    return "";
  }
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="animate-pulse p-4 sm:px-6 sm:py-5" key={index}>
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-white/7" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-white/7" />
              <div className="h-3 w-56 rounded bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyMembers() {
  return (
    <p className="px-4 py-8 text-center text-sm text-gray-400 sm:px-6">
      Select a workspace to view its members.
    </p>
  );
}

export default function MembersDirectoryTable({
  members,
  isLoading = false,
  workspaceName,
  isAdmin = false,
  onRemoveMember,
  removingMemberIds = [],
}: {
  members: TeamMember[];
  isLoading?: boolean;
  workspaceName?: string;
  isAdmin?: boolean;
  onRemoveMember?: (userId: string) => void;
  removingMemberIds?: string[];
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    return members.map((m) => ({
      ...m,
      localTime: formatTimeInZone(now, m.timezone),
    }));
  }, [members, now]);

  return (
    <section className={`${panelClass} overflow-hidden`}>
      <div className="flex flex-col gap-3 border-b border-white/6 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold sm:text-xl">Workspace Members</h3>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-[#c1c1f8]">
            {isLoading ? "Loading" : `${members.length} Active`}
          </span>
        </div>
        {workspaceName && (
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {workspaceName}
          </p>
        )}
      </div>

      <div className="divide-y divide-white/6 xl:hidden">
        {isLoading ? (
          <LoadingRows />
        ) : members.length === 0 ? (
          <EmptyMembers />
        ) : (
          rows.map((member) => (
            <div className="p-4 sm:px-6 sm:py-5" key={member.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <MemberAvatar
                    image={member.image}
                    initials={member.initials}
                    name={member.name}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {member.name}
                    </p>
                    <p className="break-all text-xs leading-5 text-gray-400">
                      {member.email}
                    </p>
                    {member.phone ? (
                      <p className="mt-1 text-xs text-gray-400">
                        {member.phone}
                      </p>
                    ) : null}
                    {member.bio ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-400">
                        {member.bio}
                      </p>
                    ) : null}
                    {member.timezone ? (
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[#c1c1f8]">
                        {member.timezone}
                        {member.localTime ? ` · ${member.localTime}` : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 pl-[60px] sm:pl-0">
                  <RoleBadge role={member.role} />
                  <button
                    disabled={
                      !isAdmin ||
                      member.canRemove === false ||
                      removingMemberIds.includes(member.id)
                    }
                    className={`rounded-lg p-2 duration-200 ${
                      isAdmin &&
                      member.canRemove !== false &&
                      !removingMemberIds.includes(member.id)
                        ? "text-gray-400 hover:bg-rose-400/10 hover:text-rose-300 cursor-pointer"
                        : "text-gray-600 cursor-not-allowed opacity-50"
                    }`}
                    title={
                      !isAdmin
                        ? "Only admins can remove members"
                        : member.canRemove === false
                          ? "Workspace owner cannot be removed"
                          : "Remove Member"
                    }
                    type="button"
                    onClick={() => onRemoveMember?.(member.id)}
                  >
                    <MdPersonRemove size={21} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden xl:block">
        {isLoading ? (
          <LoadingRows />
        ) : members.length === 0 ? (
          <EmptyMembers />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-sm text-gray-400">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Bio</th>
                <th className="px-6 py-4 font-semibold">Local Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((member) => (
                <tr
                  className="group duration-200 hover:bg-white/3"
                  key={member.id}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <MemberAvatar
                        image={member.image}
                        initials={member.initials}
                        name={member.name}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-white duration-200 group-hover:text-[#c1c1f8]">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <RoleBadge role={member.role} />
                      <button
                        disabled={
                          !isAdmin ||
                          member.canRemove === false ||
                          removingMemberIds.includes(member.id)
                        }
                        className={`rounded-lg p-2 duration-200 ${
                          isAdmin &&
                          member.canRemove !== false &&
                          !removingMemberIds.includes(member.id)
                            ? "text-gray-400 hover:bg-rose-400/10 hover:text-rose-300 cursor-pointer"
                            : "text-gray-600 cursor-not-allowed opacity-50"
                        }`}
                        title={
                          !isAdmin
                            ? "Only admins can remove members"
                            : member.canRemove === false
                              ? "Workspace owner cannot be removed"
                              : "Remove Member"
                        }
                        type="button"
                        onClick={() => onRemoveMember?.(member.id)}
                      >
                        <MdPersonRemove size={21} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs text-gray-400">
                      <div className="break-all">{member.email}</div>
                      {member.phone ? (
                        <div className="mt-1">{member.phone}</div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="line-clamp-2 text-xs leading-5 text-gray-400">
                      {member.bio || "—"}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs text-gray-400">
                      <div className="font-semibold text-[#c1c1f8]">
                        {member.timezone || "UTC"}
                      </div>
                      <div className="mt-1">
                        {(member as TeamMember & { localTime?: string })
                          .localTime || "—"}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

