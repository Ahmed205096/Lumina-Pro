import Link from "next/link";
import { BsStars } from "react-icons/bs";
import { FaCode, FaLayerGroup, FaRegLightbulb } from "react-icons/fa6";
import { MdOutlineRocketLaunch } from "react-icons/md";

const strengths = [
  {
    icon: <FaCode size={24} />,
    title: "Frontend that feels tidy",
    body: "I care about spacing, responsive screens, and the little details that make an interface feel finished.",
  },
  {
    icon: <FaLayerGroup size={24} />,
    title: "Thinking through the flow",
    body: "Before adding more UI, I like to understand what the user is trying to do and make that path easier.",
  },
  {
    icon: <MdOutlineRocketLaunch size={26} />,
    title: "Working screens, quickly",
    body: "I enjoy getting ideas into the browser fast, then cleaning them up until they feel solid.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <div className="relative overflow-hidden px-[20px] md:px-[80px] pt-[120px] pb-[50px]">
        <div className="absolute left-1/2 top-[70px] h-[140px] w-[75%] -translate-x-1/2 rounded-full bg-[#8b5cf6]/25 blur-[130px]" />
        <div className="relative z-10 grid items-center gap-[35px] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex text-[14px] uppercase items-center gap-1 border bg-[#C0C1FF]/5 border-white/10 py-[5px] px-[16px] rounded-4xl">
              <BsStars /> About
            </p>

            <h1 className="mt-[22px] max-w-[760px] text-[34px] md:text-[52px] font-bold leading-tight">
              Ahmed Khattab{" "}
              <span className="text-[#a6a7f6]">Software Engineer</span>
            </h1>

            <p className="mt-5 max-w-[660px] text-[15px] md:text-lg leading-8 text-white/70">
              I build web interfaces that are clear, fast, and easy to use. I
              like products that stay out of the way, so people can focus on the
              work instead of fighting the screen.
            </p>

            <div className="mt-[32px] flex flex-col gap-4 sm:flex-row">
              <Link href="/login">
                <button className="cursor-pointer rounded-xl bg-[#c4c5ef] px-[28px] py-[14px] text-[16px] font-bold text-[#0b0ead] transition-all duration-300 hover:bg-[#afb0f2]">
                  Start Using Lumina
                </button>
              </Link>
              <Link href="/pricing">
                <button className="cursor-pointer rounded-xl border border-white/15 px-[28px] py-[14px] text-[16px] font-bold text-white transition-all duration-300 hover:bg-white/10">
                  View Pricing
                </button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/3 p-[28px] shadow-[0_0_70px_rgba(166,167,246,0.08)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(181,182,230,0.22),transparent_40%)]" />
            <div className="relative z-10">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border border-white/10 bg-[#C0C1FF]/15 text-[#C0C1FF]">
                <FaRegLightbulb size={32} />
              </div>
              <p className="mt-[28px] text-[14px] uppercase tracking-[2px] text-white/45">
                How I think
              </p>
              <h2 className="mt-[10px] text-[27px] font-bold leading-tight">
                Clear beats clever almost every time.
              </h2>
              <p className="mt-[14px] text-[15px] leading-7 text-white/65">
                A good product does not need to shout. It should make the next
                step obvious, keep the important things close, and let people
                move without second-guessing every click.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[20px] md:px-[80px] mt-[20px]">
        <div className="grid gap-5 md:grid-cols-3">
          {strengths.map((item) => (
            <div
              key={item.title}
              className="group rounded-[22px] border border-white/10 bg-white/3 mt-[20px] p-[28px] transition-all duration-300 hover:translate-y-[-8px] hover:bg-white/5"
            >
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-white/10 bg-[#C0C1FF]/12 text-[#C0C1FF] transition-all duration-300 group-hover:bg-[#C0C1FF]/20">
                {item.icon}
              </div>
              <h3 className="mt-[22px] text-[22px] font-bold">
                {item.title}
              </h3>
              <p className="mt-[10px] text-[15px] leading-7 text-white/65">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-[20px] md:px-[80px] mt-[70px]">
        <div className="relative overflow-hidden w-full bg-white/3 p-[40px] md:p-[55px] border border-white/10 rounded-[35px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(92,96,242,0.16),transparent_45%)]" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="max-w-[680px] text-[26px] md:text-[36px] font-bold leading-tight">
              Built by Ahmed Khattab.
            </h2>
            <p className="mt-[14px] max-w-[560px] text-[16px] md:text-[18px] text-white/70">
              A software engineer who likes clean code, calm interfaces, and
              products that people can actually enjoy using.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
