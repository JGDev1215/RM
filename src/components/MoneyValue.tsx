export function formatMoney(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value);
}

export function MoneyValue({ value, decimals = 0 }: { value: number; decimals?: number }) {
  return <span className="money">{formatMoney(value, decimals)}</span>;
}
