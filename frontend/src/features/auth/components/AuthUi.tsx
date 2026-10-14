import { forwardRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

type FieldProps = {
  label: ReactNode;
  error?: string;
  hint?: ReactNode; // right side of the label row
  compact?: boolean; // 44px input (signup)
  otp?: boolean; // big centred code input
} & InputHTMLAttributes<HTMLInputElement>;

export const AuthField = forwardRef<HTMLInputElement, FieldProps>(function AuthField(
  { label, error, hint, compact, otp, type, className, ...props },
  ref,
) {
  const [shown, setShown] = useState(false);
  const isPassword = type === "password";

  const size = otp
    ? "h-16 rounded-2xl text-center text-[30px] font-black tracking-[.5em]"
    : `${compact ? "h-11" : "h-[50px]"} rounded-[14px] px-4 text-[15px] font-semibold`;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={props.id} className="text-[13px] font-extrabold text-slate-700">
          {label}
        </label>
        {hint}
      </div>
      <div className="relative">
        <input
          ref={ref}
          {...props}
          type={isPassword && shown ? "text" : type}
          aria-invalid={error ? true : undefined}
          className={`w-full border-[1.5px] bg-white text-[#020617] outline-none transition placeholder:text-slate-400 focus:border-[#2563eb] focus:shadow-[0_0_0_4px_#dbeafe] ${
            error ? "border-[#fda4af]" : "border-slate-200"
          } ${size} ${isPassword ? "pr-[52px]" : ""} ${className ?? ""}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShown((value) => !value)}
            aria-label={shown ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute top-1.5 right-1.5 flex size-[38px] items-center justify-center rounded-[10px] text-slate-500 transition hover:bg-slate-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
              {shown ? <path d="M3 3l18 18" /> : null}
            </svg>
          </button>
        ) : null}
      </div>
      {error ? <p className="text-[13px] font-bold text-[#e11d48]">{error}</p> : null}
    </div>
  );
});

type AuthButtonProps = {
  loading?: boolean;
  loadingText?: string;
  compact?: boolean; // 48px (signup)
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function AuthButton({ loading, loadingText, compact, children, disabled, ...props }: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-busy={loading}
      className={`flex w-full items-center justify-center gap-2.5 rounded-[14px] bg-[#020617] text-base font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed ${
        compact ? "h-12" : "h-[52px]"
      } ${loading ? "opacity-75" : ""}`}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-[2.5px] border-white border-r-transparent"
          style={{ animationDuration: ".7s" }}
        />
      ) : null}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

export type BannerType = "error" | "warning" | "success" | "info";
export type BannerData = { type: BannerType; title: string; text?: string };

const BANNER_STYLES: Record<BannerType, { box: string; icon: string }> = {
  error: { box: "bg-[#fff1f2] text-[#be123c]", icon: "bg-[#be123c]" },
  warning: { box: "bg-[#fffbeb] text-[#92400e]", icon: "bg-[#92400e]" },
  success: { box: "bg-[#ecfdf5] text-[#065f46]", icon: "bg-[#065f46]" },
  info: { box: "bg-[#eff6ff] text-[#1e40af]", icon: "bg-[#1e40af]" },
};

export function AuthBanner({ type, title, text }: BannerData) {
  const style = BANNER_STYLES[type];
  return (
    <div role="status" className={`flex items-start gap-2.5 rounded-[14px] px-3.5 py-3 text-sm ${style.box}`}>
      <span
        aria-hidden="true"
        className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${style.icon}`}
      >
        !
      </span>
      <div>
        <p className="font-extrabold">{title}</p>
        {text ? <p className="font-semibold">{text}</p> : null}
      </div>
    </div>
  );
}

export function AuthHeading({ title, children, small }: { title: string; children: ReactNode; small?: boolean }) {
  return (
    <div>
      <h2 className={`font-extrabold text-[#020617] ${small ? "text-[26px]" : "text-[30px]"}`}>{title}</h2>
      <p className="mt-1 text-[15px] text-slate-500">{children}</p>
    </div>
  );
}

export const authLinkClass = "font-bold text-[#2563eb] hover:text-[#1e40af] hover:underline";
