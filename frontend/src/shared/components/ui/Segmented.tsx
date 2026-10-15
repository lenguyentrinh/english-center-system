type Option<T extends string> = { key: T; label: string; count?: number };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
  /** Rounded-square track/items (12/9px) instead of pills, as in the student Word Rush filter. */
  square?: boolean;
};

/** Segmented filter: #eef2f6 track, white active item, label shows a count ("Tất cả · 12"). */
export default function Segmented<T extends string>({ options, value, onChange, className = "", square = false }: Props<T>) {
  return (
    <div role="tablist" className={`inline-flex max-w-full items-center gap-0.5 overflow-x-auto ${square ? "rounded-xl" : "rounded-full"} bg-[#eef2f6] p-1 ${className}`}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.key)}
            className={`whitespace-nowrap ${square ? "rounded-[9px]" : "rounded-full"} px-3.5 py-1.5 text-[13px] font-bold ${on ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-slate-900/5"}`}
          >
            {o.label}
            {o.count !== undefined ? ` · ${o.count}` : ""}
          </button>
        );
      })}
    </div>
  );
}
