import BaseField from "./BaseField";

type Props = {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function DateField({
  label,
  error,
  ...props
}: Props) {
  return (
    <BaseField label={label} error={error}>
      <input
        type="date"
        {...props}
        className="
          w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
          focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
        "
      />
    </BaseField>
  );
}