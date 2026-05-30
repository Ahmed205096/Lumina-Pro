import Link from "next/link";

export default function ReadSection() {
  return (
    <div className="px-[20px] md:px-[80px] mt-[60px] flex flex-col items-center">
      <div className="relative overflow-hidden w-full bg-white/3 p-[40px] md:p-[60px] border border-white/10 rounded-[35px] ">
        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top_left,rgba(181,182,230,0.2),transparent_35%)]
        "
        />

        <div
          className="
        absolute
        inset-0
        bg-[radial-gradient(circle_at_bottom_right,rgba(92,96,242,0.13),transparent_50%)]
        "
        />
        <div
          className="
        absolute
        inset-0
        bg-linear-to-t from-[#95ace8]/5 to-[#2360fa]/3)
        "
        />

        <div className="relative z-10 flex flex-col items-center">
          <h4 className="text-[25px] md:text-[33px] mb-[15px] leading-tight font-bold text-center">
            Ready to organize your workspace?
          </h4>

          <p className="text-center text-[18px] max-w-[550px] text-white/70">
            Join teams building the future with Tasker. No credit
            card required to start.
          </p>

          <Link
            className="w-full flex justify-center items-center"
            href={"/login"}
          >
            <button
              className="
            cursor-pointer

            mt-[40px]

            bg-[#c4c5ef]

            text-[18px]
            font-bold
            text-[#0b0ead]

            w-[90%]
            md:w-[250px]

            py-[15px]

            rounded-xl

            transition-all
            duration-300
            hover:bg-[#c4c5ef]/80
          "
            >
              Get Started Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
