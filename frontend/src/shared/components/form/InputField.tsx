import { forwardRef } from "react";
import BaseField from "./BaseField";

type Props = {
  label: string;
  error?: string;
} 

// This allows the component to accept all standard input attributes, such as `type`, `placeholder`, `value`, `id`, etc. 
& React.InputHTMLAttributes<HTMLInputElement>;

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
        className="
          w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
          focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
        "
      />
    </BaseField>
  );
});

export default InputField;