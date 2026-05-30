"use client";

import { useSession } from "next-auth/react";
import { useWorkspaceState } from "@/store";

export function useWorkspaceRole() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const selectedWorkspace = useWorkspaceState((state) => state.selectedWorkspace);

  if (!selectedWorkspace || !session?.user) {
    return {
      isAdmin: false,
      isOwner: false,
      isOwnerOrAdmin: false,
      role: null,
      ownerId: null,
      currentUserId: null,
    };
  }

  const currentUserId = session.user.id || "";
  const currentUserEmail = session.user.email || "";

  // Resolve Owner ID
  const ownerId = typeof selectedWorkspace.ownerId === "string"
    ? selectedWorkspace.ownerId
    : selectedWorkspace.ownerId?._id || selectedWorkspace.ownerId?.id || "";

  const isOwner = !!currentUserId && ownerId === currentUserId;

  // Resolve Member Role
  const memberEntry = selectedWorkspace.members?.find((m) => {
    const user = m.userId;
    if (typeof user === "string") {
      return user === currentUserId;
    }
    const id = user?._id || user?.id || "";
    const email = user?.email || "";
    return (id && id === currentUserId) || (email && email === currentUserEmail);
  });

  const role = memberEntry?.role ? memberEntry.role.toLowerCase() : null;
  const isAdmin = role === "admin";
  const isOwnerOrAdmin = isOwner || isAdmin;

  return {
    isAdmin,
    isOwner,
    isOwnerOrAdmin,
    role,
    ownerId,
    currentUserId,
  };
}
