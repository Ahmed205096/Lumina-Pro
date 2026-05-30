export type TeamRole = "Admin" | "Member" | "Viewer";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  initials: string;
  image?: string;
  phone?: string;
  bio?: string;
  timezone?: string;
  canRemove?: boolean;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: TeamRole;
}

// Note: mock data removed. Real data is loaded via API in TeamPage.
export const teamMembers: TeamMember[] = [];
export const pendingInvites: PendingInvite[] = [];
