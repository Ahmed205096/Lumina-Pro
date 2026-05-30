import type { TeamRole } from "./teamData";

export const roleStyles: Record<TeamRole, string> = {
  Admin: "border-[#c1c1f8]/20 bg-[#c1c1f8]/10 text-[#c1c1f8]",
  Member: "border-[#42e6f5]/20 bg-[#42e6f5]/10 text-[#42e6f5]",
  Viewer: "border-orange-300/20 bg-orange-300/10 text-orange-200",
};
