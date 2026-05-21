import type { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  isOpen: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  widthClassName?: string;
}>;

export default function Modal({
  isOpen,
  title,
  onClose,
  footer,
  widthClassName = "max-w-lg",
  children,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className={`w-full ${widthClassName} overflow-hidden rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer ? (
          <div className="border-t border-slate-200 px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}