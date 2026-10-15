import { useEffect, type PropsWithChildren } from "react";

type Props = PropsWithChildren<{ title: string; onClose: () => void; accent?: boolean }>;

/** Fixed right-hand drawer (bottom sheet on mobile) with a backdrop; does not push the layout. */
export default function Drawer({ title, onClose, accent, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-end bg-[rgba(2,6,23,.38)] sm:items-stretch"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-white p-[22px] shadow-[0_24px_64px_-12px_rgba(2,6,23,.35)] sm:m-4 sm:max-h-none sm:w-[min(420px,calc(100vw-32px))] sm:rounded-3xl ${accent ? "sm:ring-[1.5px] sm:ring-blue-300" : ""}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-black tracking-tight">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Đóng" className="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-900/5">
            ✕
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
