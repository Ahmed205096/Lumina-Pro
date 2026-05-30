"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SettingsForm from "./SettingsHelper/SettingsForm";
import SettingsSkeleton from "./SettingsHelper/SettingsSkeleton";

export const MIN_SKELETON_MS = 500;

export default function SettingsPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const update = sessionResult?.update;
  const [isSkeletonDelayDone, setIsSkeletonDelayDone] = useState(false);

  useEffect(() => {
    const delay = window.setTimeout(() => {
      setIsSkeletonDelayDone(true);
    }, MIN_SKELETON_MS);

    return () => window.clearTimeout(delay);
  }, []);

  if (status === "loading" || !isSkeletonDelayDone) {
    return <SettingsSkeleton />;
  }

  if (!session?.user || !update) {
    return <div className="text-white p-10">Please sign in again.</div>;
  }

  return (
    <SettingsForm key={session.user.id} session={session} update={update} />
  );
}
