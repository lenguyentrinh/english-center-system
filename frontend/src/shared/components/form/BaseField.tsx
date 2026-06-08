type Props = {
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  id?: string;
  required?: boolean;
};

export default function BaseField({ label, error, children, id, required }: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
            {required ? <span aria-hidden="true" className="ml-1 text-red-500">*</span> : null}
          </label>

      {children}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}