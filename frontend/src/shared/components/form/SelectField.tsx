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

export default function SelectField({
  label,
  error,
  options,
  ...props
}: Props) {
  return (
    <BaseField label={label} error={error}>
      <select
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
}