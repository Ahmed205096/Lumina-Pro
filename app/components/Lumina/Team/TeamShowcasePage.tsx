"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { glassmorphism_base } from "../Sidebar/Sidebar";
import type { TeamMember } from "./teamData";
import { useWorkspaceState } from "@/store";
import { MdOutlineEmail, MdOutlinePhone, MdOutlineSchedule } from "react-icons/md";
import RoleBadge from "./RoleBadge";
import { mapWorkspaceMembers, type WorkspaceMembersResponse } from "./teamUtils";

const membersEndpoint = process.env.NEXT_PUBLIC_WORKS_MEMBERS as string;

function formatTimeInZone(now: Date, timeZone?: string) {
  if (!timeZone) return "";
  try {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }).format(now);
  } catch {
    return "";
  }
}

export default function TeamShowcasePage() {
  const { selectedWorkspace } = useWorkspaceState();
  const selectedWorkspaceSlug = selectedWorkspace?.slug;
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selectedWorkspaceSlug || !membersEndpoint) {
      queueMicrotask(() => {
        setMembers([]);
        setIsLoading(false);
      });
      return;
    }

    let ignore = false;

    const getWorkspaceMembers = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${membersEndpoint}${encodeURIComponent(selectedWorkspaceSlug)}`,
        );

        if (!response.ok) {
          if (!ignore) setMembers([]);
          return;
        }

        const data: WorkspaceMembersResponse = await response.json();
        if (!ignore) setMembers(mapWorkspaceMembers(data));
      } catch (error) {
        console.error("Error loading workspace members:", error);
        if (!ignore) setMembers([]);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    void getWorkspaceMembers();

    return () => {
      ignore = true;
    };
  }, [selectedWorkspaceSlug]);

  return (
    <>
      <div
        className={`absolute overflow-y-clip -top-20 -right-20 h-[600px] w-[500px] rounded-full bg-linear-to-br from-[#c1c1f8]/20 to-transparent opacity-30 blur-[120px] pointer-events-none ${glassmorphism_base}`}
      />
      <div
        className={`absolute -bottom-20 -left-20 h-[600px] w-[500px] rounded-full bg-linear-to-br from-[#42e6f5]/20 to-transparent opacity-30 blur-[120px] pointer-events-none ${glassmorphism_base}`}
      />

      <main className="relative mx-auto min-h-screen w-full max-w-7xl px-4 pb-28 pt-6 text-white sm:px-6 md:p-10">
        <section className="mb-8 border-b border-white/10 pb-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Team Showcase
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 md:text-base">
            Get to know the amazing people in your workspace.
          </p>
        </section>

        {selectedWorkspace ? (
          isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[320px] animate-pulse rounded-3xl bg-white/5 border border-white/10" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-3xl border border-white/8 bg-white/3 p-8 text-center text-gray-400">
              No members found in this workspace.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#c1c1f8]/30 hover:bg-white/10 hover:shadow-[0_20px_60px_rgba(193,193,248,0.15)]"
                >
                  <div className="absolute -top-24 right-0 h-40 w-40 rounded-full bg-linear-to-br from-[#c1c1f8]/20 to-[#42e6f5]/20 blur-3xl transition-opacity duration-300 opacity-50 group-hover:opacity-100" />
                  
                  <div className="w-full px-6 pt-8 pb-4 flex flex-col items-center relative z-10">
                    <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-[#1f1f27] bg-[#2a2a35] shadow-xl">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#a6a0f0]/40 to-[#42e6f5]/30 text-2xl font-bold text-white">
                          {member.initials}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="mb-1 text-center text-lg font-bold text-white transition-colors duration-300 group-hover:text-[#c1c1f8]">
                      {member.name}
                    </h3>
                    <RoleBadge role={member.role} />
                  </div>

                  <div className="w-full flex-1 border-t border-white/5 bg-black/20 p-6 flex flex-col gap-4">
                    {member.bio && (
                      <p className="text-center text-xs italic text-gray-400 line-clamp-3 mb-2">
                        "{member.bio}"
                      </p>
                    )}
                    
                    <div className="space-y-3 mt-auto">
                      <a href={`mailto:${member.email}`} className="flex items-center gap-3 text-xs text-gray-300 hover:text-white transition-colors group/link">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 transition-colors group-hover/link:bg-[#c1c1f8]/20 group-hover/link:text-[#c1c1f8]">
                          <MdOutlineEmail size={14} />
                        </div>
                        <span className="truncate">{member.email}</span>
                      </a>
                      
                      {member.phone && (
                        <div className="flex items-center gap-3 text-xs text-gray-300">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5">
                            <MdOutlinePhone size={14} />
                          </div>
                          <span>{member.phone}</span>
                        </div>
                      )}

                      {member.timezone && (
                        <div className="flex items-center gap-3 text-xs text-gray-300">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5">
                            <MdOutlineSchedule size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider leading-tight">{member.timezone}</span>
                            <span className="font-medium text-[#42e6f5]">{formatTimeInZone(now, member.timezone)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="rounded-3xl border border-white/8 bg-white/3 p-8 text-center text-gray-400">
            Select a workspace to view its team showcase.
          </div>
        )}
      </main>
    </>
  );
}
