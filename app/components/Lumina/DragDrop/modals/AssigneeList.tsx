import type { WorkspaceMemberInfo } from "@/store";

interface AssigneeListProps {
  members: WorkspaceMemberInfo[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  locked?: boolean;
}

export default function AssigneeList({ members, selectedIds, onChange, locked }: AssigneeListProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#c7c4d7]/70">
        Assign to
      </label>
      <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-white/3 p-3">
        {locked ? (
          <p className="text-xs text-[#c7c4d7]/60">Only workspace owner/admin can assign tasks.</p>
        ) : members.length === 0 ? (
          <p className="text-xs text-[#c7c4d7]/60">No members found.</p>
        ) : (
          members.map((member) => {
            const checked = selectedIds.includes(member.id);
            return (
              <label
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/8"
                key={member.id}
              >
                <span className="min-w-0 flex-1 truncate">
                  {member.name}
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-[#c7c4d7]/60">
                    {member.role}
                  </span>
                </span>
                <input
                  checked={checked}
                  onChange={() =>
                    onChange(checked ? selectedIds.filter((id) => id !== member.id) : [...selectedIds, member.id])
                  }
                  type="checkbox"
                />
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
