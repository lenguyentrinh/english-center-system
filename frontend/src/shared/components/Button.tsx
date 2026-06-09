import { forwardRef, type ReactNode } from "react";
import classNames from "@/shared/utils/classNames";

type ButtonVariant = "primary" | "secondary" | "danger" | "success";
type ButtonSize = "small" | "medium" | "large";

type Props = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-700 active:bg-slate-800 focus:ring-slate-500",
  secondary:
    "border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-400",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  small: "px-3 py-1.5 text-xs",
  medium: "px-4 py-2 text-sm",
  large: "px-6 py-3 text-base",
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { children, variant = "primary", size = "medium", loading = false, loadingText, disabled, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
      {loading && loadingText && <span className="sr-only">{loadingText}</span>}
    </button>
  );
});

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default Button;
