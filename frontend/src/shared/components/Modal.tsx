import { useEffect, type PropsWithChildren, type ReactNode } from "react";

type Props = PropsWithChildren<{
  isOpen: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  widthClassName?: string;
  /** Small grey line under the title. */
  subtitle?: string;
}>;

/** Centered dialog on desktop, bottom sheet below 640px. Fixed + backdrop, never pushes the layout. */
export default function Modal({ isOpen, title, onClose, footer, widthClassName = "max-w-lg", subtitle, children }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(2,6,23,.38)] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full ${widthClassName} flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_24px_64px_-12px_rgba(2,6,23,.35)] sm:rounded-3xl`}
      >
        <div className="flex items-center justify-between gap-3 px-[22px] pb-2 pt-[22px]">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
            {subtitle ? <span className="text-[13px] text-slate-500">{subtitle}</span> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="grid size-9 shrink-0 place-items-center self-start rounded-full bg-slate-100 text-lg text-slate-700 hover:brightness-95">
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-[22px] py-3">{children}</div>
        {footer ? <div className="px-[22px] pb-[22px] pt-3">{footer}</div> : <div className="h-3" />}
      </div>
    </div>
  );
}
