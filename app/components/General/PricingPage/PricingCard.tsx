import Link from "next/link";
import { FaCheck } from "react-icons/fa6";
import type { PricingPlan } from "./pricingData";

interface PricingCardProps {
  plan: PricingPlan;
}

export default function PricingCard({ plan }: PricingCardProps) {
  return (
    <div
      className={`relative mt-[20px] overflow-hidden rounded-[24px] border p-[28px] transition-all duration-300 hover:translate-y-[-8px] ${
        plan.highlighted
          ? "border-[#C0C1FF]/60 bg-[#C0C1FF]/10 shadow-[0_0_60px_rgba(166,167,246,0.15)]"
          : "border-white/10 bg-white/3 hover:bg-white/5"
      }`}
    >
      {plan.highlighted ? (
        <div className="absolute right-[22px] top-[22px] rounded-full border border-[#C0C1FF]/30 bg-[#C0C1FF]/15 px-[12px] py-[5px] text-[12px] font-bold text-[#dfe0ff]">
          Most picked
        </div>
      ) : null}

      <div
        className={`flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-white/10 ${
          plan.highlighted ? "bg-[#C0C1FF]/25" : "bg-white/5"
        }`}
      >
        {plan.icon}
      </div>

      <h2 className="mt-[22px] text-[25px] font-bold">{plan.name}</h2>
      <p className="mt-[8px] min-h-[48px] text-[15px] text-white/65">
        {plan.description}
      </p>

      <div className="mt-[24px] flex items-end gap-2">
        <p className="text-[42px] font-bold leading-none">{plan.price}</p>
        <p className="pb-[5px] text-[14px] text-white/60">{plan.period}</p>
      </div>

      <Link href={plan.href}>
        <button
          className={`mt-[28px] w-full cursor-pointer rounded-xl py-[14px] text-[16px] font-bold transition-all duration-300 ${
            plan.highlighted
              ? "bg-[#c4c5ef] text-[#0b0ead] hover:bg-[#afb0f2] hover:shadow-[0_0_30px_rgba(196,197,239,0.25)]"
              : "border border-white/15 text-white hover:bg-white/10"
          }`}
        >
          {plan.cta}
        </button>
      </Link>

      <div className="mt-[28px] flex flex-col gap-3">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <span className="mt-[3px] flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#C0C1FF]/15 text-[#C0C1FF]">
              <FaCheck size={11} />
            </span>
            <p className="text-[14px] text-white/75">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
