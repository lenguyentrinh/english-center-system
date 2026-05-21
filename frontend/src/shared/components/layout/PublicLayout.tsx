import type { PropsWithChildren } from "react";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}