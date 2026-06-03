import BaseField from "./BaseField";
import classNames from "@/shared/utils/classNames";

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
    <BaseField label={label} error={error} id={props.id}>
      <input
        type="date"
        {...props}
        className={classNames(
          "w-full rounded-lg px-3 py-2 text-sm border",
          error ? "border-red-300" : "border-slate-300",
          error
            ? "focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-500"
            : "focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500",
          props.className
        )}
      />
    </BaseField>
  );
}