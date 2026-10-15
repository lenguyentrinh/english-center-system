import type { ReactNode } from "react";
import { Tag } from "@/shared/components/ui/Tag";

type Props = {
  /** Color of the tilted back layer. */
  back: string;
  status: { label: string; bg: string; fg: string };
  category: { label: string; bg: string; fg: string };
  subtitle: string;
  title: string;
  chips: string[];
  /** Total words/questions, to show "+N". */
  total: number;
  footerLeft: ReactNode;
  footerRight: ReactNode;
  onOpen: () => void;
};

/** Stacked-card tile used by the teacher Flashcard / Word Rush grids (and mirrored by the admin library). */
export default function StackedCard({ back, status, category, subtitle, title, chips, total, footerLeft, footerRight, onOpen }: Props) {
  const shown = chips.slice(0, 3);
  return (
    <div className="relative pb-2 pr-2">
      <span className="absolute bottom-0 left-2.5 right-0 top-2.5 rotate-[1.6deg] rounded-3xl" style={{ background: back }} aria-hidden />
      <button
        type="button"
        onClick={onOpen}
        className="relative flex w-full flex-col gap-3.5 rounded-3xl bg-white p-5 text-left shadow-[0_0_0_1px_#e6ebf3,0_10px_24px_-14px_rgba(15,23,42,.25)] hover:brightness-[.97]"
      >
        <div className="flex items-center justify-between gap-2">
          <Tag bg={status.bg} fg={status.fg} width={124}>
            {status.label}
          </Tag>
          <Tag bg={category.bg} fg={category.fg} className="max-w-[140px]">
            {category.label}
          </Tag>
        </div>
        <span className="-mt-2 truncate text-xs font-bold text-slate-500">{subtitle}</span>
        <div className="flex min-h-[52px] flex-col gap-1">
          <span className="text-lg font-black leading-tight tracking-tight text-slate-950">{title}</span>
        </div>
        <div className="flex min-h-[30px] flex-wrap gap-1.5">
          {shown.map((w, i) => (
            <span key={`${w}-${i}`} className="max-w-full truncate rounded-[10px] bg-slate-100 px-2.5 py-[5px] text-[13px] font-extrabold text-slate-700">
              {w}
            </span>
          ))}
          {total > shown.length ? <span className="rounded-[10px] bg-blue-50 px-2.5 py-[5px] text-[13px] font-extrabold text-blue-800">+{total - shown.length}</span> : null}
        </div>
        <div className="flex items-center justify-between gap-2.5 border-t border-dashed border-slate-200 pt-3.5">
          <span className="text-[13px] font-extrabold text-slate-950">{footerLeft}</span>
          <span className="text-xs font-bold text-slate-500">{footerRight}</span>
        </div>
      </button>
    </div>
  );
}

/** Dashed "create" tile that ends the grid. */
export function NewTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-2 mr-2 flex min-h-[250px] flex-col items-center justify-center gap-2.5 rounded-3xl border-2 border-dashed border-slate-300 text-[15px] font-extrabold text-slate-600 hover:bg-slate-900/5"
    >
      <span className="grid size-12 place-items-center rounded-full bg-blue-50 text-[26px] font-bold leading-none text-blue-600">+</span>
      {label}
    </button>
  );
}
