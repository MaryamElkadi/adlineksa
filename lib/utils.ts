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

export function getProductStartingPrice(
  basePrice: number,
  quantityTiers?: { quantity: number; unitPrice: number }[]
): number {
  return getProductStartingPriceDetails(basePrice, quantityTiers).unitPrice;
}

export function getProductStartingPriceDetails(
  basePrice: number,
  quantityTiers?: { quantity: number; unitPrice: number }[]
): { quantity: number; unitPrice: number } {
  const validTiers = (quantityTiers || [])
    .filter(({ quantity, unitPrice }) =>
      Number.isFinite(quantity) &&
      quantity > 0 &&
      Number.isFinite(unitPrice) &&
      unitPrice > 0
    )
    .sort((a, b) => a.unitPrice - b.unitPrice || a.quantity - b.quantity);

  if (validTiers.length > 0) {
    return validTiers[0];
  }

  return { quantity: 1, unitPrice: Number(basePrice) || 0 };
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
