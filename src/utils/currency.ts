/**
 * Formats a numeric value into Indonesian Rupiah (IDR).
 * Example: 15000 -> "Rp 15.000"
 */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
