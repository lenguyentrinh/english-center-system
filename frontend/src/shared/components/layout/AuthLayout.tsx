import type { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import signupLoginBg from "@/assets/images/signup_login_bg.png";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

const tabs = [
  { to: "/auth/login", label: "Login" },
  { to: "/auth/signup", label: "Sign up" },
];

export default function AuthLayout({ children }: PropsWithChildren) {
  const location = useLocation();

  return (
    <main className="relative min-h-screen bg-cover bg-contain bg-no-repeat" style={{ backgroundImage: `url(${signupLoginBg})` }}>
      <Header />
      <div className="absolute inset-0 bg-white/20 lg:bg-transparent" />
      <div className="relative flex min-h-[calc(100vh-64px)] items-center px-4 py-8 sm:px-6">
        <div className="w-full lg:ml-[7%]">
          <div
            className="w-full animate-fade-in rounded-2xl bg-white/85 p-8 shadow-2xl backdrop-blur-md sm:w-full md:w-[90%] lg:max-w-[460px]"
            style={{ animation: "fadeInUp 0.6s ease-out" }}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
                English Center
              </Link>
              <div className="inline-flex flex-shrink-0 rounded-lg border border-slate-200 bg-white/50 p-1 backdrop-blur-sm">
                {tabs.map((tab) => {
                  const isActive = location.pathname === tab.to;
                  return (
                    <Link
                      key={tab.to}
                      to={tab.to}
                      className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition sm:px-3 sm:py-1.5 sm:text-sm ${
                        isActive
                          ? "bg-slate-900 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>{children}</div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out;
        }

        /* Tablet & Mobile: Center positioning */
        @media (max-width: 1023px) {
          main > div > div {
            margin-left: 0 !important;
            margin-right: auto;
            margin-left: auto;
          }
        }
      `}</style>
    </main>
  );
}
