import { Tag } from "./ui/Tag";
import { roleColors, roleLabel } from "@/shared/utils/role";

type Props = { title: string; name: string; username: string; roles: string[]; code: string };

/** Credit-card shaped member card (aspect 1.586) on a tilted #bfdbfe back layer. Shared by the 3 account pages. */
export default function MemberCard({ title, name, username, roles, code }: Props) {
  const shown = roles.slice(0, 2);
  return (
    <div className="relative mx-auto w-full max-w-[380px] min-[1100px]:mx-0 min-[1100px]:pt-12">
      <div className="relative">
        <span className="absolute inset-0 rotate-[2.2deg] rounded-[24px] bg-[#bfdbfe]" aria-hidden />
        <div
          className="relative flex aspect-[1.586] flex-col justify-between overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_#e6ebf3,0_6px_18px_-10px_rgba(15,23,42,.18)]"
          style={{ backgroundImage: "radial-gradient(#e2e8f0 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-[9px] bg-[#1f2937] text-sm font-black text-white">E</span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-black text-slate-950">English Center</span>
              <span className="text-[11px] font-bold text-slate-500">{title}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#1f2937] text-xl font-black text-white">{name.charAt(0).toUpperCase()}</span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-lg font-black text-slate-950">{name}</span>
              <span className="truncate text-[13px] font-semibold text-slate-500">@{username}</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex gap-1.5">
              {shown.map((r) => {
                const c = roleColors(r);
                return (
                  <Tag key={r} bg={c.bg} fg={c.fg}>
                    {roleLabel(r)}
                  </Tag>
                );
              })}
            </span>
            <span className="text-[11px] font-extrabold tracking-wider text-slate-400">{code}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
