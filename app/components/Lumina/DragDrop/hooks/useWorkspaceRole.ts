import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export interface WorkspaceMember {
  id: string;
  name: string;
  role: string;
  image?: string;
}

export function useWorkspaceRole(selectedWorkspaceSlug?: string) {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);

  useEffect(() => {
    if (!selectedWorkspaceSlug) {
      queueMicrotask(() => {
        setMembers([]);
        setIsOwnerOrAdmin(false);
      });
      return;
    }

    let ignore = false;

    const loadMembers = async () => {
      try {
        const res = await fetch(
          `/api/workspace?workspaceSlug=${encodeURIComponent(selectedWorkspaceSlug)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          ownerId?: { _id?: string; id?: string; name?: string; email?: string; image?: string };
          members?: { userId?: { _id?: string; id?: string; name?: string; email?: string; image?: string } | string; role?: string }[];
        };

        if (ignore) return;

        const ownerId =
          typeof data.ownerId === "string"
            ? data.ownerId
            : data.ownerId?._id || data.ownerId?.id || "";

        const currentUserId = session?.user?.id || "";
        const memberEntry = data.members?.find((member) => {
          const user = member.userId;
          const id =
            typeof user === "string" ? user : user?._id || user?.id || "";
          return id && id === currentUserId;
        });

        const owner = data.ownerId;
        const ownerName =
          typeof owner === "string"
            ? "Workspace Owner"
            : owner?.name || owner?.email || "Workspace Owner";

        const ownerImage =
          typeof owner === "string" ? "" : owner?.image || "";

        const nextMembers: WorkspaceMember[] = [];
        if (ownerId)
          nextMembers.push({
            id: ownerId,
            name: ownerName,
            role: "owner",
            image: ownerImage || undefined,
          });

        data.members?.forEach((member) => {
          const user = member.userId;
          const id =
            typeof user === "string" ? user : user?._id || user?.id || "";
          if (!id || id === ownerId) return;
          const name =
            typeof user === "string"
              ? "Member"
              : user?.name || user?.email || "Member";
          const image =
            typeof user === "string" ? "" : user?.image || "";
          nextMembers.push({
            id,
            name,
            role: member.role || "member",
            image: image || undefined,
          });
        });

        setMembers(nextMembers);
        setIsOwnerOrAdmin(
          ownerId === currentUserId ||
            memberEntry?.role?.toLowerCase?.() === "admin",
        );
      } catch {
        if (!ignore) {
          setMembers([]);
          setIsOwnerOrAdmin(false);
        }
      }
    };

    queueMicrotask(() => {
      void loadMembers();
    });

    return () => {
      ignore = true;
    };
  }, [selectedWorkspaceSlug, session?.user?.id]);

  return { members, isOwnerOrAdmin, currentUserId: session?.user?.id || "" };
}
