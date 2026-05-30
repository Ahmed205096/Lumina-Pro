"use client";

import type { NotificationItem } from "./hooks/useNotifications";

interface NotificationItemProps {
  notification: NotificationItem;
  markingIds: string[];
  acceptingIds: string[];
  markAsRead: (id: string) => Promise<void>;
  handleInviteResponse: (notification: NotificationItem, state: "accepted" | "declined") => Promise<void>;
}

function formatNotificationDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function NotificationItemComponent({
  notification,
  markingIds,
  acceptingIds,
  markAsRead,
  handleInviteResponse,
}: NotificationItemProps) {
  return (
    <div className="flex gap-3 px-4 py-3 duration-200 hover:bg-white/5">
      <span
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
          notification.isRead ? "bg-white/20" : "bg-[#42e6f5]"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {notification.title}
            </p>
            {notification.onModel === "Workspace" && notification.senderId && (
              <p className="mt-0.5 text-xs text-gray-400">
                {notification.senderId.name} invited you to{" "}
                <span className="text-[#c1c1f8]">
                  {notification.entityId}
                </span>
              </p>
            )}
          </div>
          <span className="shrink-0 text-[10px] text-gray-500">
            {formatNotificationDate(notification.createdAt)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">
          {notification.message}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#c1c1f8]">
            {notification.type.replaceAll("_", " ")}
          </p>
          <div className="flex gap-2">
            {notification.type === "WORKSPACE_INVITATION" && !notification.isRead && (
              <>
                <button
                  className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 duration-200 hover:bg-emerald-500/20 disabled:cursor-wait disabled:opacity-60"
                  disabled={acceptingIds.includes(notification._id)}
                  onClick={() => handleInviteResponse(notification, "accepted")}
                  type="button"
                >
                  {acceptingIds.includes(notification._id) ? "..." : "Accept"}
                </button>
                <button
                  className="shrink-0 rounded-full border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-400 duration-200 hover:bg-rose-500/20 disabled:cursor-wait disabled:opacity-60"
                  disabled={acceptingIds.includes(notification._id)}
                  onClick={() => handleInviteResponse(notification, "declined")}
                  type="button"
                >
                  {acceptingIds.includes(notification._id) ? "..." : "Decline"}
                </button>
              </>
            )}
            {!notification.isRead && notification.type !== "WORKSPACE_INVITATION" && (
              <button
                className="shrink-0 rounded-full border border-[#42e6f5]/25 bg-[#42e6f5]/10 px-2.5 py-1 text-[10px] font-bold text-[#42e6f5] duration-200 hover:bg-[#42e6f5]/20 disabled:cursor-wait disabled:opacity-60"
                disabled={markingIds.includes(notification._id)}
                onClick={() => markAsRead(notification._id)}
                type="button"
              >
                {markingIds.includes(notification._id) ? "Saving..." : "Mark as read"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
