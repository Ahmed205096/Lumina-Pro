interface SectionPanelProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionPanel({
  children,
  className = "",
}: SectionPanelProps) {
  return (
    <section
      className={`rounded-3xl border border-white/8 bg-white/3 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.18)] ${className}`}
    >
      {children}
    </section>
  );
}
