const OPTIONS = [
  { value: "low",    label: "Low",  active: "border-[#00cbe6] bg-[#00cbe6]/15 text-[#00cbe6]" },
  { value: "medium", label: "Med",  active: "border-[#ffb783] bg-[#ffb783]/15 text-[#ffb783]" },
  { value: "high",   label: "High", active: "border-rose-400 bg-rose-400/15 text-rose-300" },
] as const;

interface PriorityPickerProps {
  value: "low" | "medium" | "high";
  onChange: (v: "low" | "medium" | "high") => void;
}

export default function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#c7c4d7]/70">
        Priority
      </label>
      <div className="flex h-11 gap-2">
        {OPTIONS.map((opt) => (
          <button
            className={`flex-1 rounded-xl border text-xs font-bold uppercase tracking-wide transition ${
              value === opt.value
                ? opt.active
                : "border-white/10 bg-white/5 text-[#c7c4d7]/50 hover:bg-white/10 hover:text-[#c7c4d7]"
            }`}
            key={opt.value}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
