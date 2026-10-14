import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ title: string; onClose: () => void; accent?: boolean }>;

/** Fixed right-hand drawer for create/detail forms; does not push the layout. */
export default function Drawer({ title, onClose, accent, children }: Props) {
  return (
    <aside
      className={`fixed right-4 top-4 z-40 flex max-h-[calc(100vh-32px)] w-[min(380px,calc(100vw-32px))] flex-col overflow-y-auto rounded-3xl bg-white p-5 shadow-[0_24px_64px_-12px_rgba(2,6,23,.35)] ${accent ? "border-[1.5px] border-blue-300" : "border border-slate-200"}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[17px] font-extrabold">{title}</h3>
        <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">
          ✕
        </button>
      </div>
      {children}
    </aside>
  );
}
