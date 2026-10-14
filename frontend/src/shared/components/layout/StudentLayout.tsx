import type { PropsWithChildren } from "react";
import Sidebar from "./Sidebar";

export default function StudentLayout({ children, wide }: PropsWithChildren<{ wide?: boolean }>) {
  return (
    <div className="flex min-h-screen flex-nowrap items-start bg-slate-50 text-slate-800">
      <Sidebar role="student" />
      <main className="min-w-0 flex-1 px-[clamp(16px,3vw,40px)] py-[22px]">
        <div className={`mx-auto ${wide ? "max-w-[1400px]" : "max-w-[1240px]"}`}>{children}</div>
      </main>
    </div>
  );
}
