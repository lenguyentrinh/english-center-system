import type { ReactNode } from "react";

export default function PageHeader({ crumb, title, actions }: { crumb?: ReactNode; title: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {crumb ? <p className="text-[13px] font-semibold text-slate-500">{crumb}</p> : null}
        <h1 className="text-[30px] font-extrabold leading-tight">{title}</h1>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Bordered table frame (rounded 24). Pagination goes inside as the last child. */
export function TableFrame({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">{children}</div>;
}

export const thClass = "sticky top-0 bg-white px-5 py-3 text-left text-xs font-bold text-slate-500";
export const tdClass = "px-5 py-3 text-sm";
export const primaryBtn = "rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800";
export const outlineBtn = "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50";
