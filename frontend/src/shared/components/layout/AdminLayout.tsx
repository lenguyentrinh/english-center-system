import type { PropsWithChildren } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="md:flex">
        <Sidebar />
        <section className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}