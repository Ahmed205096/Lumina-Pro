import Link from "next/link";
import { BsStars } from "react-icons/bs";
import PricingCard from "./PricingCard";
import { plans, questions } from "./pricingData";

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      <div className="relative overflow-hidden px-[20px] md:px-[80px] pt-[120px] pb-[40px]">
        <div className="absolute left-1/2 top-[80px] h-[120px] w-[70%] -translate-x-1/2 rounded-full bg-[#8b5cf6]/25 blur-[120px]" />
        <div className="relative z-10 flex flex-col items-center">
          <p className="flex text-[14px] uppercase items-center gap-1 border bg-[#C0C1FF]/5 border-white/10 py-[5px] px-[16px] rounded-4xl">
            <BsStars /> Pricing
          </p>

          <h1 className="mt-[20px] max-w-[780px] text-center text-[32px] md:text-[48px] font-bold leading-tight">
            Choose the plan that{" "}
            <span className="text-[#a6a7f6]">feels right for now</span>
          </h1>

          <p className="mt-4 max-w-[640px] text-center text-[15px] md:text-lg text-white/70">
            Start small, keep the team organized, and upgrade when you actually
            need the extra room.
          </p>

          <div className="mt-[30px] flex items-center rounded-2xl border border-white/10 bg-white/4 p-[5px] text-[14px] font-bold">
            <span className="rounded-xl bg-[#C0C1FF] px-[18px] py-[9px] text-[#1000A9]">
              Monthly
            </span>
            <span className="px-[18px] py-[9px] text-white/70">
              Yearly saves 20%
            </span>
          </div>
        </div>
      </div>

      <div className="px-[20px] md:px-[80px] mt-[25px]">
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>

      <div className="px-[20px] md:px-[80px] mt-[70px]">
        <div className="grid gap-4 md:grid-cols-3">
          {questions.map((item) => (
            <div
              key={item.question}
              className="rounded-[20px] border border-white/10 bg-white/3 p-[24px]"
            >
              <h3 className="text-[18px] font-bold">{item.question}</h3>
              <p className="mt-[10px] text-[14px] leading-6 text-white/65">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-[20px] md:px-[80px] mt-[60px] flex flex-col items-center">
        <div className="relative overflow-hidden w-full bg-white/3 p-[40px] md:p-[60px] border border-white/10 rounded-[35px] ">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(181,182,230,0.2),transparent_35%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(92,96,242,0.13),transparent_50%)]" />
          <div className="absolute inset-0 bg-linear-to-t from-[#95ace8]/5 to-[#2360fa]/3)" />

          <div className="relative z-10 flex flex-col items-center">
            <h4 className="text-[25px] md:text-[33px] mb-[15px] leading-tight font-bold text-center">
              Want to try it with your team?
            </h4>

            <p className="text-center text-[18px] max-w-[550px] text-white/70">
              Create a workspace, add a few tasks, and see if it clicks.
            </p>

            <Link className="w-full flex justify-center items-center" href="/login">
              <button className="cursor-pointer mt-[40px] bg-[#c4c5ef] text-[18px] font-bold text-[#0b0ead] w-[90%] md:w-[250px] py-[15px] rounded-xl transition-all duration-300">
                Start Free
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
