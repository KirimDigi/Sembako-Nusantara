// Utility functions for dual-currency support (Yen JPY & Rupiah IDR)

export type CurrencyType = 'JPY' | 'IDR';

// Kurs default: 1 JPY = Rp 105
export const DEFAULT_JPY_TO_IDR_RATE = 105;

/**
 * Mengambil kurs aktif dari localStorage atau menggunakan default (105)
 */
export function getActiveExchangeRate(): number {
  if (typeof window === 'undefined') return DEFAULT_JPY_TO_IDR_RATE;
  const stored = localStorage.getItem('sn_kurs_jpy_to_idr');
  if (stored) {
    const parsed = Number(stored);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_JPY_TO_IDR_RATE;
}

/**
 * Menyimpan kurs baru ke localStorage
 */
export function saveActiveExchangeRate(rate: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sn_kurs_jpy_to_idr', rate.toString());
}

/**
 * Konversi nominal Yen ke Rupiah (dibulatkan ke kelipatan 100 terdekat atau integer)
 */
export function convertJpyToIdr(jpyAmount: number, rate: number = getActiveExchangeRate()): number {
  return Math.round(jpyAmount * rate);
}

/**
 * Format angka ke format Rupiah (Rp)
 */
export function formatIdr(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
}

/**
 * Format angka ke format Yen (¥)
 */
export function formatJpy(amount: number): string {
  return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
}

/**
 * Format nominal sesuai mata uang yang dipilih
 */
export function formatPriceByCurrency(
  jpyAmount: number,
  currency: CurrencyType,
  rate: number = getActiveExchangeRate()
): string {
  if (currency === 'IDR') {
    return formatIdr(convertJpyToIdr(jpyAmount, rate));
  }
  return formatJpy(jpyAmount);
}
