type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

/** Pill search field, 42px high, search icon on the left and an × button to clear. */
export default function SearchInput({ value, onChange, placeholder = "Tìm kiếm", className = "" }: Props) {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <svg
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-[42px] w-full rounded-full border border-slate-200 bg-white pl-10 pr-10 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:shadow-[0_0_0_4px_#dbeafe]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Xoá tìm kiếm"
          className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
