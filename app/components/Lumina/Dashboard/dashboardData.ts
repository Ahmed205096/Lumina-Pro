export const panelClass =
  "rounded-2xl border border-white/8 bg-[#1f1f27]/60 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.2)]";

// Note: mock data removed. Components should render empty states until real data exists.
export const velocityBars: number[] = [];
export const weekDays: string[] = [];
export const projects: unknown[] = [];
export const tasks: {
  title: string;
  project: string;
  note: string;
  icon: "calendar" | "priority";
  tone: string;
  assignee: string;
}[] = [];
