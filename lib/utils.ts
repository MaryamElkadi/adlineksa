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
  quantity: number = 1,
  sizeModifier: number = 0,
  materialModifier: number = 0,
  laminationAddon: number = 0
): number {
  const totalPrice = basePrice + sizeModifier + materialModifier + laminationAddon;
  return Math.round(totalPrice * 100) / 100;
}
