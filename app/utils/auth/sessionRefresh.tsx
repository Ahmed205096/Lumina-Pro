"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionRefetcher() {
  const sessionResult = useSession();
  const update = sessionResult?.update;

  useEffect(() => {
    if (!update) return;

    const handleFocus = () => {
      update();
    };

    window.addEventListener("focus", handleFocus);
    const interval = setInterval(() => {
      update();
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [update]);

  return null;
}
