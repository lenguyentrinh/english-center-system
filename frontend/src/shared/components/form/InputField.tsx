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
    <BaseField label={label} error={error} id={props.id}>
      <input
        ref={ref}
        {...props}
        className={classNames(
          "w-full rounded-lg px-3 py-2 text-sm border",
          error ? "border-red-500" : "border-slate-300",
          error
            ? "focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            : "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
          props.className
        )}
      />
    </BaseField>
  );
});

export default InputField;