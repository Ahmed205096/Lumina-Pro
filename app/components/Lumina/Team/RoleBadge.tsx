import { roleStyles } from "./roleStyles";
import type { TeamRole } from "./teamData";

export default function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}
