"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { createPortal } from "react-dom";
import { HiOutlineCalendar } from "react-icons/hi";
import "react-day-picker/style.css";

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDateKey(value?: string) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) return null;
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function startOfDayLocal(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function DatePicker({
  value,
  min,
  disabled,
  onChange,
  label = "Due date",
  placement = "bottom",
}: {
  value: string;
  min?: string;
  disabled?: boolean;
  onChange: (nextValue: string) => void;
  label?: string;
  placement?: "top" | "bottom";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => startOfDayLocal(new Date()));
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});

  const selectedDate = useMemo(() => parseLocalDateKey(value), [value]);
  const minDate = useMemo(() => parseLocalDateKey(min), [min]);
  const disabledBefore = useMemo(
    () => (minDate ? startOfDayLocal(minDate) : undefined),
    [minDate],
  );
  const today = useMemo(() => startOfDayLocal(new Date()), []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      const popover = popoverRef.current;
      if (!root) return;
      if (!(event.target instanceof Node)) return;
      const clickedInsideRoot = root.contains(event.target);
      const clickedInsidePopover = popover ? popover.contains(event.target) : false;
      if (!clickedInsideRoot && !clickedInsidePopover) setIsOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const anchor = buttonRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const gap = 8;
      const width = Math.max(rect.width, 320);

      // Keep within viewport horizontally.
      const padding = 12;
      const maxLeft = Math.max(padding, window.innerWidth - padding - width);
      const left = Math.min(Math.max(rect.left, padding), maxLeft);

      const estimatedHeight = 390; // good enough for clamp before first paint
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const preferTop = placement === "top";
      const placeTop = preferTop
        ? spaceAbove >= estimatedHeight || spaceAbove > spaceBelow
        : spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

      const top = placeTop ? rect.top - gap : rect.bottom + gap;

      setPopoverStyle({
        position: "fixed",
        left,
        top,
        width,
        zIndex: 1000,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    // Capture scroll on any parent (including containers), not only window.
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, placement]);

  const displayValue = value ? value : "Select date";

  const toggle = () => {
    if (disabled) return;

    const base = selectedDate || today;
    const nextMonth = new Date(base.getFullYear(), base.getMonth(), 1);
    const minMonth = disabledBefore
      ? new Date(disabledBefore.getFullYear(), disabledBefore.getMonth(), 1)
      : null;

    setMonth(minMonth && nextMonth < minMonth ? minMonth : nextMonth);
    setIsOpen((open) => !open);
  };

  return (
    <div className="relative" ref={rootRef}>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#c7c4d7]/70">
        {label}
      </label>

      <button
        className="flex h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-left text-sm text-white transition hover:bg-white/8 focus:outline-none focus:border-[#c0c1ff]/40 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={toggle}
        ref={buttonRef}
        type="button"
      >
        <HiOutlineCalendar
          aria-hidden="true"
          className="text-[#c7c4d7]/70"
          size={18}
        />
        <span className={value ? "text-white" : "text-[#c7c4d7]/50"}>
          {displayValue}
        </span>
        <span className="ml-auto text-[#c7c4d7]/40">▾</span>
      </button>

      {isOpen
        ? createPortal(
            <div
              className="rounded-2xl border border-white/12 bg-white/6 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
              style={popoverStyle}
              ref={popoverRef}
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(192,193,255,0.16),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(93,230,255,0.12),transparent_55%)]" />
              <div className="relative p-4">
                <DayPicker
                  disabled={
                    disabledBefore ? { before: disabledBefore } : undefined
                  }
                  mode="single"
                  month={month}
                  onMonthChange={setMonth}
                  onSelect={(day) => {
                    if (!day) return;
                    onChange(toLocalDateKey(startOfDayLocal(day)));
                    setIsOpen(false);
                  }}
                  selected={selectedDate || undefined}
                  showOutsideDays
                  weekStartsOn={0}
                  classNames={{
                    root: "text-white w-full",
                    months: "w-full",
                    month: "w-full",
                    month_caption:
                      "flex items-center justify-between gap-2 mb-4 px-1",
                    caption_label:
                      "text-base font-bold text-white select-none",
                    nav: "flex items-center gap-1",
                    button_previous:
                      "grid h-8 w-8 place-items-center rounded-lg bg-white/8 text-white transition hover:bg-white/15 hover:text-white active:bg-white/20",
                    button_next:
                      "grid h-8 w-8 place-items-center rounded-lg bg-white/8 text-white transition hover:bg-white/15 hover:text-white active:bg-white/20",
                    month_grid: "w-full table-fixed border-collapse",
                    weekdays: "",
                    weekday:
                      "pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-white/45 w-[calc(100%/7)]",
                    weeks: "",
                    week: "",
                    day: "p-[2px] text-center align-middle",
                    day_button:
                      "mx-auto grid h-8 w-8 place-items-center rounded-lg text-sm font-medium text-white/90 transition hover:bg-white/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c0c1ff]/50",
                    outside: "opacity-30",
                    disabled:
                      "opacity-20 cursor-not-allowed pointer-events-none",
                    today:
                      "font-bold text-white ring-1 ring-inset ring-white/30 rounded-lg",
                    selected:
                      "!bg-[#4f6ef7] !text-white font-semibold shadow-[0_0_0_2px_rgba(79,110,247,0.4)] hover:!bg-[#4f6ef7] rounded-lg",
                    chevron: "fill-white/80 w-4 h-4",
                  }}
                />

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                  <button
                    className="rounded-lg px-3 py-1.5 font-semibold text-white/60 transition hover:bg-white/8 hover:text-white/90"
                    onClick={() => {
                      onChange("");
                      setIsOpen(false);
                    }}
                    type="button"
                  >
                    Clear
                  </button>

                  <button
                    className="rounded-lg bg-white/8 px-3 py-1.5 font-semibold text-[#a5b4fc] transition hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={Boolean(disabledBefore && today < disabledBefore)}
                    onClick={() => {
                      onChange(toLocalDateKey(today));
                      setIsOpen(false);
                    }}
                    type="button"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
