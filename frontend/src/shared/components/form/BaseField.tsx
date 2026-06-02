type Props = {
  label: string;
  error?: string;
  children: React.ReactNode;
  id?: string;
};

export default function BaseField({ label, error, children, id }: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      {children}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}