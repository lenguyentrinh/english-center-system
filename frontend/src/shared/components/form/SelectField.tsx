import { forwardRef } from "react";
import BaseField from "./BaseField";
import classNames from "@/shared/utils/classNames";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: React.ReactNode;
  error?: string;
  options: Option[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

const SelectField = forwardRef<HTMLSelectElement, Props>(function SelectField(
  { label, error, options, ...props },
  ref
) {
  return (
    <BaseField label={label} error={error} id={props.id}>
      <select
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
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </BaseField>
  );
});

export default SelectField;