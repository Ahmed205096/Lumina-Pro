import type { TeamMember, TeamRole } from "./teamData";

export interface PopulatedUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  phone?: string;
  bio?: string;
  timezone?: string;
}

export interface WorkspaceMembersResponse {
  ownerId?: PopulatedUser | string;
  members?: { userId: PopulatedUser | string; role: string; joinedAt?: string }[];
  name?: string;
  slug?: string;
}

export function getUserId(user: PopulatedUser | string | undefined): string {
  if (!user) return "";
  if (typeof user === "string") return user;
  return user._id || user.id || "";
}

export function getUserName(user: PopulatedUser | string | undefined, fallback: string): string {
  if (!user || typeof user === "string") return fallback;
  return user.name || user.email || fallback;
}

export function getUserEmail(user: PopulatedUser | string | undefined): string {
  if (!user || typeof user === "string") return "";
  return user.email || "";
}

export function getUserImage(user: PopulatedUser | string | undefined): string {
  if (!user || typeof user === "string") return "";
  return user.image || "";
}

export function getUserPhone(user: PopulatedUser | string | undefined): string {
  if (!user || typeof user === "string") return "";
  return user.phone || "";
}

export function getUserBio(user: PopulatedUser | string | undefined): string {
  if (!user || typeof user === "string") return "";
  return user.bio || "";
}

export function getUserTimezone(user: PopulatedUser | string | undefined): string {
  if (!user || typeof user === "string") return "";
  return user.timezone || "";
}

export function getInitials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function normalizeRole(role: string): TeamRole {
  const lower = role.toLowerCase();
  if (lower === "admin") return "Admin";
  if (lower === "viewer") return "Viewer";
  return "Member";
}

export function mapWorkspaceMembers(
  data: WorkspaceMembersResponse,
  canRemoveMembers = true,
): TeamMember[] {
  const members: TeamMember[] = [];
  const seen = new Set<string>();

  const addMember = (
    user: PopulatedUser | string | undefined,
    role: TeamRole,
    fallbackName: string,
    canRemove: boolean,
  ) => {
    const id = getUserId(user);
    if (id && seen.has(id)) return;
    if (id) seen.add(id);

    const name = getUserName(user, fallbackName);
    const email = getUserEmail(user);

    members.push({
      id: id || `${name}-${role}`,
      name,
      email,
      role,
      initials: getInitials(name || email),
      image: getUserImage(user) || undefined,
      phone: getUserPhone(user) || undefined,
      bio: getUserBio(user) || undefined,
      timezone: getUserTimezone(user) || undefined,
      canRemove,
    });
  };

  addMember(data.ownerId, "Admin", "Workspace Owner", false);
  data.members?.forEach((m) =>
    addMember(m.userId, normalizeRole(m.role), "Workspace Member", canRemoveMembers),
  );

  return members;
}
