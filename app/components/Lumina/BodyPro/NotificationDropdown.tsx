"use client";

import { createPortal } from "react-dom";
import type { NotificationItem } from "./hooks/useNotifications";
import NotificationItemComponent from "./NotificationItem";

interface NotificationDropdownProps {
  isOpen: boolean;
  isLoading: boolean;
  sortedNotifications: NotificationItem[];
  markingIds: string[];
  acceptingIds: string[];
  menuPosition: { left: number; top: number; width: number };
  getNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  handleInviteResponse: (notification: NotificationItem, state: "accepted" | "declined") => Promise<void>;
}

export default function NotificationDropdown({
  isOpen,
  isLoading,
  sortedNotifications,
  markingIds,
  acceptingIds,
  menuPosition,
  getNotifications,
  markAsRead,
  handleInviteResponse,
}: NotificationDropdownProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed z-[1000] overflow-hidden rounded-2xl border border-white/10 bg-[#1f1f27] shadow-[0_24px_70px_rgba(0,0,0,0.38)]"
      style={{
        left: menuPosition.left,
        top: menuPosition.top,
        width: menuPosition.width,
      }}
    >
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <h3 className="text-sm font-bold text-white">Notifications</h3>
        <button
          className="text-xs font-semibold text-[#c1c1f8] duration-200 hover:text-white"
          onClick={getNotifications}
          type="button"
        >
          Refresh
        </button>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="animate-pulse space-y-2" key={index}>
                <div className="h-4 w-40 rounded bg-white/8" />
                <div className="h-3 w-full rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : sortedNotifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            No notifications yet.
          </p>
        ) : (
          <div className="divide-y divide-white/6">
            {sortedNotifications.map((notification) => (
              <NotificationItemComponent
                key={notification._id}
                notification={notification}
                markingIds={markingIds}
                acceptingIds={acceptingIds}
                markAsRead={markAsRead}
                handleInviteResponse={handleInviteResponse}
              />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
