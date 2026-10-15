import { forwardRef } from "react";
import BaseField from "./BaseField";
import classNames from "@/shared/utils/classNames";

type Props = {
  label: React.ReactNode;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputField = 
//  `forwardRef` is used to forward the ref to the underlying input element, allowing parent components to directly access it if needed (e.g., for focusing).
forwardRef<HTMLInputElement, Props>(function InputField(
  { label, error, ...props },
  ref
) {
  return (
    <BaseField label={label} error={error} id={props.id} required={props.required}>
      <input
        ref={ref}
        {...props}
        className={classNames(
          "w-full rounded-xl px-3 py-2.5 text-sm font-semibold border bg-white",
          error ? "border-rose-300" : "border-slate-200",
          error
            ? "focus:border-rose-400 focus:outline-none focus:shadow-[0_0_0_4px_#ffe4e6]"
            : "focus:border-blue-600 focus:outline-none focus:shadow-[0_0_0_4px_#dbeafe]",
          props.className
        )}
      />
    </BaseField>
  );
});

export default InputField;