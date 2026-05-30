import { create } from "zustand";

export const selectedWorkspaceKey = "lumina:selected-workspace-slug";

interface ISidebar {
  isOpen: boolean;
  setIsOpen: () => void;
}

interface IUserInfo {
  userInfo: object;
  setUserInfo: (userInfo: object) => void;
}

export interface WorkspaceMemberRef {
  userId:
    | string
    | {
        _id?: string;
        id?: string;
        name?: string;
        email?: string;
        image?: string;
      };
  role: string;
  joinedAt?: string;
}

export interface WorkspaceSummary {
  _id: string;
  name: string;
  slug: string;
  ownerId?:
    | string
    | {
        _id?: string;
        id?: string;
        name?: string;
        email?: string;
        image?: string;
      };
  members: WorkspaceMemberRef[];
}

interface IWorkspaceState {
  workspaces: WorkspaceSummary[];
  selectedWorkspace: WorkspaceSummary | null;
  hasLoadedWorkspaces: boolean;
  setWorkspaces: (workspaces: WorkspaceSummary[]) => void;
  setWorkspaceData: (
    workspaces: WorkspaceSummary[],
    selectedWorkspace: WorkspaceSummary | null,
  ) => void;
  setSelectedWorkspace: (workspace: WorkspaceSummary | null) => void;
}

// ─── Selector helpers ────────────────────────────────────────────────────────

function resolveId(
  ref: WorkspaceSummary["ownerId"] | WorkspaceMemberRef["userId"],
): string {
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  return ref._id || ref.id || "";
}

export interface WorkspaceMemberInfo {
  id: string;
  name: string;
  role: string;
  image?: string;
}

export function isWorkspaceOwnerOrAdmin(
  workspace: WorkspaceSummary | null,
  userId: string,
): boolean {
  if (!workspace || !userId) return false;
  if (resolveId(workspace.ownerId) === userId) return true;
  const member = workspace.members.find((m) => resolveId(m.userId) === userId);
  return member?.role?.toLowerCase() === "admin";
}

export function getWorkspaceMembersInfo(
  workspace: WorkspaceSummary | null,
): WorkspaceMemberInfo[] {
  if (!workspace) return [];

  const result: WorkspaceMemberInfo[] = [];
  const ownerId = resolveId(workspace.ownerId);
  const ownerRef = workspace.ownerId;
  const ownerName =
    typeof ownerRef === "string"
      ? "Workspace Owner"
      : ownerRef?.name || ownerRef?.email || "Workspace Owner";
  const ownerImage =
    typeof ownerRef === "string" ? undefined : ownerRef?.image ?? undefined;

  if (ownerId) result.push({ id: ownerId, name: ownerName, role: "owner", image: ownerImage });

  workspace.members.forEach((m) => {
    const id = resolveId(m.userId);
    if (!id || id === ownerId) return;
    const u = m.userId;
    const name = typeof u === "string" ? "Member" : u?.name || u?.email || "Member";
    const image = typeof u === "string" ? undefined : u?.image ?? undefined;
    result.push({ id, name, role: m.role || "member", image });
  });

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────

export const useSidebarState = create<ISidebar>((set) => ({
  isOpen: true,
  setIsOpen: () => set((store) => ({ isOpen: !store.isOpen })),
}));

export const useUserInfo = create<IUserInfo>((set) => ({
  userInfo: {},
  setUserInfo: (userInfo: object) => set({ userInfo }),
}));

export const useWorkspaceState = create<IWorkspaceState>((set) => ({
  workspaces: [],
  selectedWorkspace: null,
  hasLoadedWorkspaces: false,
  setWorkspaces: (workspaces) =>
    set({ workspaces, hasLoadedWorkspaces: true }),
  setWorkspaceData: (workspaces, selectedWorkspace) =>
    set({ workspaces, selectedWorkspace, hasLoadedWorkspaces: true }),
  setSelectedWorkspace: (selectedWorkspace) => set({ selectedWorkspace }),
}));
