import { forwardRef } from "react";
import BaseField from "./BaseField";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  error?: string;
  options: Option[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

const SelectField = forwardRef<HTMLSelectElement, Props>(function SelectField(
  { label, error, options, ...props },
  ref
) {
  return (
    <BaseField label={label} error={error}>
      <select
        ref={ref}
        {...props}
        className="
          w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
          focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
        "
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