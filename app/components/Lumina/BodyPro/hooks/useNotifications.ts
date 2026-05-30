"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useWorkspaceState } from "@/store";

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  senderId?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  entityId?: string;
  onModel?: string;
}

const notificationEndpoint = process.env.NEXT_PUBLIC_NOTIFICATION as string;

export function useNotifications(isOpen: boolean) {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const userEmail = session?.user?.email;
  const { workspaces, setWorkspaceData } = useWorkspaceState();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [markingIds, setMarkingIds] = useState<string[]>([]);
  const [acceptingIds, setAcceptingIds] = useState<string[]>([]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      ),
    [notifications],
  );

  const getNotifications = useCallback(async () => {
    if (!notificationEndpoint) return;

    setIsLoading(true);

    try {
      const response = await fetch(notificationEndpoint);

      if (!response.ok) {
        setNotifications([]);
        return;
      }

      const data: NotificationItem[] = await response.json();
      setNotifications(data);
      setHasLoaded(true);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const silentlyUpdateNotifications = useCallback(async () => {
    if (!notificationEndpoint) return;

    try {
      const response = await fetch(notificationEndpoint);

      if (!response.ok) return;

      const data: NotificationItem[] = await response.json();

      setNotifications((prevNotifications) => {
        const newNotifications = data.filter(
          (newNotif) =>
            !prevNotifications.some((prevNotif) => prevNotif._id === newNotif._id)
        );

        if (newNotifications.length > 0) {
          return [...newNotifications, ...prevNotifications];
        }

        return prevNotifications;
      });
    } catch (error) {
      console.error("Error silently updating notifications:", error);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    if (!notificationEndpoint) return;

    const previousNotifications = notifications;
    setMarkingIds((ids) => [...ids, id]);
    setNotifications((items) =>
      items.map((notification) =>
        notification._id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );

    try {
      const response = await fetch(notificationEndpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        setNotifications(previousNotifications);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setNotifications(previousNotifications);
    } finally {
      setMarkingIds((ids) =>
        ids.filter((markingId) => markingId !== id),
      );
    }
  }, [notifications]);

  const handleInviteResponse = useCallback(
    async (notification: NotificationItem, state: "accepted" | "declined") => {
      if (!notification.entityId || !userEmail) return;

      const endpoint = process.env.NEXT_PUBLIC_REMOVE_INVITE_ADD_MEMBER;
      if (!endpoint) return;

      setAcceptingIds((ids) => [...ids, notification._id]);

      try {
        const response = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspaceSlug: notification.entityId,
            email: userEmail,
            state,
          }),
        });

        if (!response.ok) {
          console.error(`Error ${state} invite`);
          return;
        }

        if (state === "accepted") {
          const workspaceData = await response.json();
          const newWorkspace = {
            _id: workspaceData._id,
            name: workspaceData.name,
            slug: workspaceData.slug,
            ownerId: workspaceData.ownerId,
            members: workspaceData.members,
          };
          setWorkspaceData([...workspaces, newWorkspace], newWorkspace);
        }

        setNotifications((items) =>
          items.filter((n) => n._id !== notification._id),
        );
        await markAsRead(notification._id);
      } catch (error) {
        console.error(`Error ${state} invite:`, error);
      } finally {
        setAcceptingIds((ids) =>
          ids.filter((id) => id !== notification._id),
        );
      }
    },
    [markAsRead, userEmail, workspaces, setWorkspaceData],
  );

  useEffect(() => {
    if (!hasLoaded) {
      queueMicrotask(() => {
        void getNotifications();
      });
    }

    const interval = setInterval(() => {
      if (isOpen) {
        void silentlyUpdateNotifications();
      } else {
        void getNotifications();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [hasLoaded, isOpen, getNotifications, silentlyUpdateNotifications]);

  return {
    notifications,
    unreadCount,
    sortedNotifications,
    isLoading,
    hasLoaded,
    markingIds,
    acceptingIds,
    getNotifications,
    markAsRead,
    handleInviteResponse,
  };
}
