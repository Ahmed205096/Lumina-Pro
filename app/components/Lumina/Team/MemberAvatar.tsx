export default function MemberAvatar({
  initials,
  isOnline,
}: {
  initials: string;
  isOnline?: boolean;
}) {
  return (
    <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-linear-to-br from-[#a6a0f0]/35 to-[#42e6f5]/15 text-sm font-bold text-white">
      {initials}
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#13131b] ${
            isOnline ? "bg-[#42e6f5]" : "bg-gray-500"
          }`}
        />
      )}
    </div>
  );
}
