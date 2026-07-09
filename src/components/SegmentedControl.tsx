export function SegmentedControl<T extends string>({ label, options, value, onChange }: { label: string; options: { label: string; value: T }[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="segmented-field">
      <span>{label}</span>
      <div className="segmented">
        {options.map((option) => (
          <button key={option.value} className={value === option.value ? 'selected' : ''} type="button" onClick={() => onChange(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
