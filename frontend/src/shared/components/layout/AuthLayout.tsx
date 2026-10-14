import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import WarmupQuiz from "@/features/auth/components/WarmupQuiz.tsx";

type Props = PropsWithChildren<{
  cardTag: string;
  cardIpa: string;
}>;

const dotGrid = {
  backgroundImage: "radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)",
  backgroundSize: "26px 26px",
};

export default function AuthLayout({ cardTag, cardIpa, children }: Props) {
  return (
    <main
      className="auth-root relative min-h-screen overflow-hidden bg-[#020617] font-sans text-white"
      style={dotGrid}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6vw] bottom-[-8vw] select-none font-black leading-none"
        style={{ fontSize: "clamp(160px,26vw,420px)", color: "rgba(255,255,255,.035)" }}
      >
        ___
      </div>

      <Link
        to="/"
        className="absolute top-[clamp(16px,3vw,36px)] left-[clamp(16px,4vw,56px)] z-10 flex items-center gap-3"
      >
        <span className="flex size-[42px] items-center justify-center rounded-xl bg-white text-xl font-black text-[#020617]">
          E
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-lg font-semibold text-white">English Center</span>
          <span className="text-sm text-slate-400">Trung tâm Anh ngữ</span>
        </span>
      </Link>

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-row-reverse flex-wrap content-center items-center justify-center gap-x-[clamp(80px,10vw,180px)] gap-y-[clamp(28px,4vw,64px)] px-[clamp(16px,4vw,56px)] pt-[calc(clamp(16px,3vw,36px)+58px)] pb-[clamp(16px,3vw,40px)]">
        <div className="relative min-w-0 max-w-[440px] flex-[1_1_380px]">
          <div className="absolute inset-0 rounded-[32px] bg-[#0891b2]" style={{ transform: "rotate(5deg) translate(8px,8px)" }} />
          <div className="absolute inset-0 rounded-[32px] bg-[#2563eb]" style={{ transform: "rotate(-3deg) translate(-6px,5px)" }} />
          <div className="relative flex flex-col gap-[clamp(18px,2.4vw,24px)] rounded-[32px] bg-white p-[clamp(20px,3.4vw,40px)] text-[#020617] shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)]">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">{cardTag}</span>
              <span className="text-xs font-bold text-slate-400">{cardIpa}</span>
            </div>
            {children}
          </div>
        </div>

        <div className="hidden min-w-0 max-w-[660px] flex-[1_1_520px] min-[1080px]:flex">
          <WarmupQuiz />
        </div>
      </div>

      <style>{`
        html:has(.auth-root) { scrollbar-width: none; }
        html:has(.auth-root)::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}
