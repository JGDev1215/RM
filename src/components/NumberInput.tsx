export function NumberInput({ label, value, onChange, step = 'any', min, suffix }: { label: string; value: number; onChange: (value: number) => void; step?: string; min?: number; suffix?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <input inputMode="decimal" min={min} step={step} type="number" value={Number.isNaN(value) ? '' : value} onChange={(event) => onChange(Number(event.target.value))} />
        {suffix ? <em>{suffix}</em> : null}
      </div>
    </label>
  );
}
