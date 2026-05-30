"use client";
import { useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";
import type { Session } from "next-auth";
import { MdCheckCircle, MdErrorOutline, MdStars } from "react-icons/md";
import { useSession } from "next-auth/react";
import { MIN_SKELETON_MS } from "../settings";
import { glassmorphism_base } from "../../Sidebar/Sidebar";
import SettingsSkeleton from "./SettingsSkeleton";
type UpdateSession = ReturnType<typeof useSession>["update"];
type SaveStatus = "idle" | "success" | "error";

export default function SettingsForm({
  session,
  update,
}: {
  session: Session;
  update: UpdateSession;
}) {
  const user = session.user!;

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [timezone, setTimezone] = useState(user.timezone || "NaN");
  const [bio, setBio] = useState(user.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSkeletonVisible, setIsSaveSkeletonVisible] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const handleSave = async () => {
    const saveStartedAt = Date.now();
    setIsSaving(true);
    setIsSaveSkeletonVisible(true);
    setSaveStatus("idle");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_GET_USER_INFO}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, timezone, bio }),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        await update({
          user: {
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            timezone: updatedUser.timezone,
            bio: updatedUser.bio,
          },
        });

        setSaveStatus("success");
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus("error");
    } finally {
      const elapsed = Date.now() - saveStartedAt;
      const remainingDelay = Math.max(MIN_SKELETON_MS - elapsed, 0);

      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay));
      }

      setIsSaveSkeletonVisible(false);
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setTimezone(user.timezone || "NaN");
    setBio(user.bio || "");
  };

  const input_fields = (
    title: string,
    icon: React.ReactNode,
    id: string,
    type: string,
    value: string,
    onChangeHandler: (val: string) => void,
    readOnly = false,
  ) => (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-[13px] text-gray-400 font-medium">{title}</p>
      <label
        className={`border w-full border-white/10 px-5 flex justify-between items-center h-[60px] rounded-xl focus-within:border-white/30 duration-200 ${
          readOnly ? "bg-white/2 cursor-not-allowed" : "bg-white/4"
        }`}
        htmlFor={id}
      >
        <input
          id={id}
          type={type}
          onChange={(e) => onChangeHandler(e.target.value)}
          value={value}
          readOnly={readOnly}
          className={`outline-none bg-transparent w-full pr-3 ${
            readOnly ? "text-gray-400 cursor-not-allowed" : "text-white"
          }`}
        />
        <span className="text-gray-400 shrink-0">{icon}</span>
      </label>
    </div>
  );

  if (isSaveSkeletonVisible) {
    return <SettingsSkeleton />;
  }

  return (
    <>
      <div
        className={`absolute -top-20 -right-20 w-[500px] h-[600px] 
          rounded-full blur-[120px] bg-linear-to-br from-blue-400/20 to-transparent 
          opacity-30 pointer-events-none ${glassmorphism_base}`}
      />
      <div
        className={`absolute -bottom-20 -left-20 w-[500px] h-[600px] 
          rounded-full blur-[120px] bg-linear-to-br from-violet-400/20 to-transparent 
          opacity-30 pointer-events-none ${glassmorphism_base}`}
      />

      <div className="min-h-screen overflow-y-clip  p-6 md:p-10 max-w-7xl mx-auto w-full text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-1">
            <h3 className="overflow-clip font-bold text-2xl md:text-3xl tracking-tight">
              Account Settings
            </h3>
            <p className="text-gray-400 text-sm md:text-base">
              Manage your profile information.
            </p>
          </div>
          <div className="flex items-center gap-2 border border-white/20 rounded-full py-1.5 px-4 bg-white/5 w-fit self-start sm:self-auto">
            <MdStars className="text-[#42e6f5] text-lg" />
            <p className="text-xs md:text-sm font-semibold tracking-wide uppercase">
              Pro Account
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl w-full p-6 md:p-8 bg-white/2 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-5 border-b border-white/5 pb-6">
            <div className="rounded-full bg-linear-to-b from-blue-400/30 to-blue-600/30 p-1 shadow-lg shadow-blue-500/10">
              <Image
                src={user.image || "/person.jpg"}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-xl md:text-2xl font-bold">
                {name || "User Name"}
              </h4>
              <p className="text-xs text-gray-400">
                Update your personal details.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
              {input_fields(
                "User Name",
                <FaRegUser />,
                "name",
                "text",
                name,
                setName,
              )}
              {input_fields(
                "Email Address",
                <MdEmail />,
                "email",
                "email",
                email,
                setEmail,
                true,
              )}
              {input_fields(
                "Phone Number",
                <FaPhoneAlt />,
                "phone",
                "text",
                phone,
                setPhone,
              )}

              <div className="flex flex-col gap-2 w-full relative">
                <p className="text-[13px] text-gray-400 font-medium">
                  Timezone
                </p>
                <div className="relative w-full">
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full appearance-none border outline-0 border-white/10 px-5 h-[60px] bg-white/4 rounded-xl text-white cursor-pointer pr-12 focus:border-white/30 duration-200"
                  >
                    <option value="NaN">Not Selected</option>

                    <option
                      value="America/Los_Angeles"
                      className="bg-[#1f1f27]"
                    >
                      Pacific Time - LA
                    </option>
                    <option value="America/New_York" className="bg-[#1f1f27]">
                      Eastern Time - NY
                    </option>

                    <option value="Europe/London" className="bg-[#1f1f27]">
                      London / GMT
                    </option>
                    <option value="Europe/Berlin" className="bg-[#1f1f27]">
                      Paris / Berlin
                    </option>

                    <option value="Africa/Cairo" className="bg-[#1f1f27]">
                      Cairo / Egypt
                    </option>
                    <option value="Asia/Riyadh" className="bg-[#1f1f27]">
                      Riyadh / Saudi Arabia
                    </option>
                    <option value="Asia/Dubai" className="bg-[#1f1f27]">
                      Dubai / UAE
                    </option>

                    <option value="Asia/Kolkata" className="bg-[#1f1f27]">
                      Mumbai / India
                    </option>
                    <option value="Asia/Singapore" className="bg-[#1f1f27]">
                      Singapore
                    </option>
                    <option value="Asia/Tokyo" className="bg-[#1f1f27]">
                      Tokyo / Japan
                    </option>
                    <option value="Australia/Sydney" className="bg-[#1f1f27]">
                      Sydney / Melbourne
                    </option>
                  </select>
                  <IoIosArrowDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <p className="text-[13px] text-gray-400 font-medium">
                Professional Bio
              </p>
              <textarea
                className="w-full text-white resize-none h-[170px] outline-none border border-white/10 p-5 bg-white/4 rounded-xl focus:border-white/30 duration-200 text-sm leading-relaxed"
                placeholder="Write something about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
        </div>

        {saveStatus !== "idle" && (
          <div
            role="status"
            className={`mt-8 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              saveStatus === "success"
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                : "border-rose-400/20 bg-rose-400/10 text-rose-100"
            }`}
          >
            {saveStatus === "success" ? (
              <MdCheckCircle className="text-xl text-emerald-300" />
            ) : (
              <MdErrorOutline className="text-xl text-rose-300" />
            )}
            <span>
              {saveStatus === "success"
                ? "Profile changes saved."
                : "Could not save changes. Please try again."}
            </span>
          </div>
        )}

        <div className="flex justify-center md:justify-end gap-5 mt-10">
          <button
            onClick={handleDiscard}
            className="px-5 py-3 rounded-xl hover:bg-white/10 duration-200 cursor-pointer bg-white/5 border border-white/10 text-white"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-3 rounded-xl hover:bg-blue-600 duration-200 cursor-pointer bg-blue-500 border border-white/10 text-white disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </>
  );
}
