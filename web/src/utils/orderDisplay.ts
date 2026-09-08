export const isGenericVariantName = (name?: string) =>
  !name || ['standard plant pot', 'available', 'default'].includes(name.trim().toLowerCase());

export const formatOrderAmount = (value: number | string | null | undefined) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString() : '-';
};