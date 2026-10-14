type Props = {
  page: number; // 1-based
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
};

/** Footer shown under every table: always rendered, even when everything fits on one page. */
export default function Pagination({ page, total, pageSize = 10, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  const navBtn =
    "rounded-lg px-3 py-1.5 text-[13px] font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent";

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[13px] font-semibold text-slate-500">
      <span>
        {from}–{to} trên {total}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" className={navBtn} disabled={current <= 1} onClick={() => onChange(current - 1)}>
          ‹ Trước
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-8 min-w-8 rounded-lg px-2 text-[13px] font-bold ${n === current ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {n}
          </button>
        ))}
        <button type="button" className={navBtn} disabled={current >= pages} onClick={() => onChange(current + 1)}>
          Sau ›
        </button>
      </div>
    </div>
  );
}
