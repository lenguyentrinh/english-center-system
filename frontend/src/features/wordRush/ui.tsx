import type { ReactNode } from "react";
import { fmtDeadline } from "./store.ts";
import type { WRSet } from "./types.ts";

export function ModeChip({ s }: { s: WRSet }) {
  if (!s.selfPaced) return <span className="inline-block whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">Chỉ trình chiếu</span>;
  if (s.mode === "game")
    return <span className="inline-block whitespace-nowrap rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-bold text-cyan-800">Tự luyện · hạn {fmtDeadline(s.deadline)}</span>;
  return <span className="inline-block whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">Kiểm tra {s.testMin}′ · hạn {fmtDeadline(s.deadline)}</span>;
}

/** Sentence with the blank replaced by a chip showing the right answer (or "?"). */
export function SentenceWithAnswer({ text, answer }: { text: string; answer?: string }) {
  const parts = text.split("___");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 ? (
            <span className={`mx-1 inline-block rounded-md px-2 ${answer ? "bg-emerald-100 font-extrabold text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{answer || "___"}</span>
          ) : null}
        </span>
      ))}
    </>
  );
}

export function StatStrip({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="flex flex-col border-t-2 border-slate-950 pt-2.5">
          <span className="text-[26px] font-black leading-tight tabular-nums text-slate-950">{it.value}</span>
          <span className="text-xs font-bold text-slate-500">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ value, items, onChange }: { value: T; items: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex gap-1 rounded-full bg-slate-100 p-1">
      {items.map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={`rounded-full px-4 py-1.5 text-sm font-bold ${value === k ? "bg-white text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,.05)]" : "text-slate-500 hover:text-slate-800"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
