"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { VscBellDot } from "react-icons/vsc";
import { useNotifications } from "./hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const {
    unreadCount,
    sortedNotifications,
    isLoading,
    hasLoaded,
    markingIds,
    acceptingIds,
    getNotifications,
    markAsRead,
    handleInviteResponse,
  } = useNotifications(isOpen);

  const [menuPosition, setMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 320,
  });

  const updateMenuPosition = useCallback(() => {
    const buttonElement = buttonRef.current;
    if (!buttonElement) return;

    const rect = buttonElement.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const left = Math.min(
      Math.max(12, rect.right - width),
      window.innerWidth - width - 12,
    );

    setMenuPosition({
      left,
      top: rect.bottom + 10,
      width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  // Close dropdown on route change (browser back/forward)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleToggle = () => {
    updateMenuPosition();
    setIsOpen((value) => !value);

    if (!hasLoaded) {
      void getNotifications();
    }
  };

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        className="relative cursor-pointer rounded-2xl p-[7px] text-white duration-300 hover:bg-violet-300 hover:text-black"
        onClick={handleToggle}
        ref={buttonRef}
        type="button"
      >
        <VscBellDot size={18} />
        {unreadCount > 0 && (
          <>
            <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 animate-pulse rounded-full bg-[#ff5c7a]" />
            <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#ff5c7a] px-1 text-[10px] font-bold leading-none text-white shadow-lg shadow-[#ff5c7a]/50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        isLoading={isLoading}
        sortedNotifications={sortedNotifications}
        markingIds={markingIds}
        acceptingIds={acceptingIds}
        menuPosition={menuPosition}
        getNotifications={getNotifications}
        markAsRead={markAsRead}
        handleInviteResponse={handleInviteResponse}
      />
    </div>
  );
}
