type Props = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export default function BaseField({ label, error, children }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-red-500">
        {label}
      </label>

      {children}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}