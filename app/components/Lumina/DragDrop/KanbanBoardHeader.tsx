import {
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineUsers,
} from "react-icons/hi";

const avatarTones = [
  "bg-[#6366f1] text-white",
  "bg-[#00cbe6] text-[#00363e]",
  "bg-[#ffb783] text-[#4f2500]",
  "bg-[#c0c1ff] text-[#1000a9]",
  "bg-emerald-300 text-[#00382a]",
];

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function MemberAvatar({
  name,
  image,
  tone,
}: {
  name: string;
  image?: string;
  tone: string;
}) {
  return (
    <span
      className={`relative grid h-8 w-8 place-items-center overflow-hidden rounded-full ring-2 ring-[#13131b] text-[11px] font-bold ${tone}`}
      title={name}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={name}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          src={image}
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

export default function KanbanBoardHeader({
  onAddTask,
  workspaceName,
  members = [],
  isOwnerOrAdmin = false,
}: {
  onAddTask?: () => void;
  workspaceName?: string;
  members?: { id: string; name: string; image?: string }[];
  isOwnerOrAdmin?: boolean;
}) {
  const visibleMembers = members.slice(0, 3);
  const extraCount = Math.max(0, members.length - visibleMembers.length);

  return (
    <section className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#c7c4d7]/60">
          <span>Projects</span>
          <HiOutlineChevronRight aria-hidden="true" size={14} />
          <span className="text-[#c7c4d7]">{workspaceName || "Pulse Dev"}</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          {workspaceName ? `${workspaceName} Board` : "Project Pulse Development"}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex -space-x-3">
            {visibleMembers.map((member, index) => (
              <MemberAvatar
                image={member.image}
                key={member.id}
                name={member.name}
                tone={avatarTones[index % avatarTones.length]}
              />
            ))}
            {extraCount > 0 ? (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-semibold text-[#c7c4d7] ring-2 ring-[#13131b]">
                +{extraCount}
              </span>
            ) : null}
          </div>

          <span className="h-4 w-px bg-white/15" />

          <div className="flex items-center gap-2 text-sm font-medium text-[#c7c4d7]/80">
            <HiOutlineUsers aria-hidden="true" size={18} />
            <span>{members.length} member{members.length === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>

      {isOwnerOrAdmin ? (
        <button
          onClick={onAddTask}
          className="flex w-fit items-center gap-2 rounded-full bg-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_2px_rgba(99,102,241,0.15)] transition hover:bg-[#6366f1]/90 active:scale-95"
          type="button"
        >
          <HiOutlinePlus aria-hidden="true" size={20} />
          Add New Task
        </button>
      ) : null}
    </section>
  );
}
