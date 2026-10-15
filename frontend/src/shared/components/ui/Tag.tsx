import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  bg: string;
  fg: string;
  /** Fixed width keeps tags aligned down a table column (design v5: 124 class status, 108 role, 96 conflict...). */
  width?: number | string;
  title?: string;
  className?: string;
};

/** Pill tag with fixed width + centered, ellipsized text. */
export function Tag({ children, bg, fg, width, title, className = "" }: Props) {
  const style: CSSProperties = { background: bg, color: fg, width };
  return (
    <span
      title={title}
      style={style}
      className={`inline-block max-w-full truncate rounded-full px-2.5 py-[3px] text-center text-xs font-extrabold ${className}`}
    >
      {children}
    </span>
  );
}

/** Dot + text status (user status, "Đã giao"...). */
export function StatusDot({ dot, fg, bg, width = 120, children }: { dot: string; fg: string; bg: string; width?: number; children: ReactNode }) {
  return (
    <span style={{ background: bg, color: fg, width }} className="inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-[3px] text-xs font-extrabold">
      <span style={{ background: dot }} className="size-1.5 shrink-0 rounded-full" />
      <span className="truncate">{children}</span>
    </span>
  );
}
