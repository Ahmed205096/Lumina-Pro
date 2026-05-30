import { MdSpeed } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { MdOutlineSecurity } from "react-icons/md";

interface ICard {
  icon: React.ReactNode;
  title: string;
  body: string;
  bg?: string;
  hoverBg?: string;
}

export default function EngineeredSection() {
  const card = ({
    icon,
    title,
    body,
    bg = "bg-[#9193e4]/20",
    hoverBg = "bg-[#9193e4]/30",
  }: ICard) => (
    <div className="group mt-[20px] hover:translate-y-[-10px] hover:bg-white/2 duration-300 flex h-auto flex-col p-[30px] border border-white/10 min-w-[200px] rounded-[20px]">
      <div
        className={`${bg} group-hover:${hoverBg} duration-300 w-[50px] h-[50px] rounded-[10px] border border-white/10 flex justify-center items-center`}
      >
        {icon}
      </div>
      <h4 className="mt-[20px] text-[25px] font-bold leading-tight">{title}</h4>
      <p className="mt-[10px] text-[16px] flex-1">{body}</p>
    </div>
  );

  return (
    <>
      <div className="px-[20px] md:px-[80px] mt-[60px] md:mt-[120px] flex flex-col items-center">
        <h3 className="text-[25px] md:text-[35px] font-bold">
          Engineered for deep work
        </h3>
        <p className="text-center">
          We&apos;ve stripped away the noise so you can focus on building what
          matters.
        </p>
        <div className="mt-[20px] flex flex-col md:flex-row justify-center items-stretch gap-4">
          {card({
            icon: <MdSpeed size={30} />,
            title: "Lightning Performance",
            body: "Built on a distributed architecture that ensures sub-100ms response times for every interaction. Your workflow, uninterrupted.",
          })}

          {card({
            icon: <FaPeopleGroup color="#64d0e8" size={30} />,
            title: "Real-time Presence",
            body: "See who is working on what in real-time. Collaborative cursors and live updates mean zero friction for distributed teams.",
            bg: "bg-[#64d0e8]/10",
            hoverBg: "bg-[#64d0e8]/20",
          })}

          {card({
            icon: <MdOutlineSecurity color="#e89964" size={30} />,
            title: "Scalable Infrastructure",
            body: "From solo developers to enterprises with millions of users, our platform scales seamlessly to meet your demands.",
            bg: "bg-orange-300/10",
            hoverBg: "bg-orange-300/20",
          })}
        </div>
      </div>
    </>
  );
}
