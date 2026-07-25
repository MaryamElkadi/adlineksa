export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number, currency = 'SAR'): string {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculateConfiguredPrice(
  basePrice: number,
  quantity: number,
  sizeMultiplier: number = 1,
  materialMultiplier: number = 1,
  laminationAddon: number = 0
): number {
  const unitPrice = basePrice * sizeMultiplier * materialMultiplier + laminationAddon;
  // Volume discount calculation
  let volumeDiscount = 1;
  if (quantity >= 1000) volumeDiscount = 0.75;
  else if (quantity >= 500) volumeDiscount = 0.85;
  else if (quantity >= 250) volumeDiscount = 0.92;

  return Math.round(unitPrice * quantity * volumeDiscount * 100) / 100;
}
