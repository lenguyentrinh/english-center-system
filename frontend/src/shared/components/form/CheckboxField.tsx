import classNames from "@/shared/utils/classNames";
import { forwardRef } from "react";

type Props = {
  label: React.ReactNode;
  error?: string;
  id?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const CheckboxField = forwardRef<HTMLInputElement, Props>(function CheckboxField({ label, error, id, required, ...props }, ref) {
  return (
    <div className="flex items-center gap-3">
      <input id={id} ref={ref} type="checkbox" {...props} className={classNames("h-4 w-4", props.className)} />
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span aria-hidden="true" className="ml-1 text-red-500">*</span> : null}
      </label>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
});

export default CheckboxField;
