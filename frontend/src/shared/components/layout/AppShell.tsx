import type { PropsWithChildren } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";
import type { NAV } from "./navConfig";

/** Role layout: site header on top, sidebar/bottom nav + full-width main, site footer at the bottom. */
export default function AppShell({ role, children }: PropsWithChildren<{ role: keyof typeof NAV }>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f3f6fb] text-slate-800">
      <Header />
      <div className="flex flex-1 items-start">
        <Sidebar role={role} />
        <main className="min-w-0 flex-1 px-3 pb-8 pt-4 min-[900px]:px-11 min-[900px]:pb-10 min-[900px]:pt-6">{children}</main>
      </div>
      <div className="pb-[64px] min-[900px]:pb-0">
        <Footer />
      </div>
    </div>
  );
}
