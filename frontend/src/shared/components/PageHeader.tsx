import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function PageHeader({ crumb, title, actions }: { crumb?: ReactNode; title: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        {crumb ? <span className="text-[13px] font-semibold text-slate-500">{crumb}</span> : null}
        <h1 className="text-[clamp(26px,3.4vw,34px)] font-black leading-tight tracking-tight text-slate-950">{title}</h1>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** "← Quay lại" link, underlined (design rule: no "→" in labels, back links use "←"). */
export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-[13px] font-bold text-slate-600 underline underline-offset-4 hover:opacity-70">
      ← {children}
    </Link>
  );
}

/** Surface panel: white, radius 22, hairline ring + soft shadow. */
export const surfaceClass = "rounded-[22px] bg-white shadow-[0_0_0_1px_#e6ebf3,0_6px_18px_-10px_rgba(15,23,42,.12)]";

/** Table frame. Pagination goes inside as the last child. */
export function TableFrame({ children }: { children: ReactNode }) {
  return <div className={`${surfaceClass} overflow-hidden`}>{children}</div>;
}

export const thClass = "whitespace-nowrap border-b border-[#eef2f6] px-5 py-3 text-left text-xs font-bold text-slate-500";
export const tdClass = "px-5 py-3 text-sm";
export const rowClass = "border-b border-dashed border-[#eef2f6] last:border-b-0";
export const primaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1f2937] px-4 py-2 text-sm font-bold text-white hover:bg-[#0b1220] disabled:opacity-50";
export const outlineBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-100 disabled:opacity-50";
export const fieldClass =
  "w-full rounded-xl border-[1.5px] border-slate-200 bg-[#f8fafc] px-3 py-[11px] text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:shadow-[0_0_0_4px_#dbeafe]";
export const fieldErrClass = "!border-rose-300";
export const labelClass = "mb-1 block text-xs font-bold text-slate-600";
