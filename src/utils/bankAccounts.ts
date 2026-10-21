export interface BankAccountItem {
  id: string;
  accountName: string;
  accountNumber: string;
  accountType: 'BANK_JP' | 'BANK_ID' | 'CASH_STORE';
  bankName: string;
  branchName?: string;
  holderName?: string;
  currency: 'JPY' | 'IDR';
  balance: number;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
}

// Tidak ada data akun bank fiktif bawaan. Hanya akun resmi yang didaftarkan langsung oleh pengguna yang akan tampil.
export const DEFAULT_OFFICIAL_BANK_ACCOUNTS: BankAccountItem[] = [];

export function getStoredBankAccounts(): BankAccountItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('sn_bank_accounts_v3');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Bersihkan dan hapus akun bank dummy/fiktif lama jika tersimpan di cache browser
        const cleaned = parsed.filter(
          (acc: any) =>
            acc &&
            acc.accountNumber !== '10120-12345671' &&
            acc.accountNumber !== '012-7654321' &&
            acc.accountNumber !== '887-3456789' &&
            acc.accountNumber !== '822-019-2819' &&
            acc.accountNumber !== 'CASH-TKY-01'
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('sn_bank_accounts_v3', JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Failed reading sn_bank_accounts_v3', e);
  }
  return [];
}

/**
 * Record cash out transaction automatically in Accounting (sn_cash_out_v3)
 */
export function recordAccountingCashOut(entry: {
  date: string;
  category: string;
  amount: number;
  sourceAccount: string;
  recipient: string;
  notes: string;
  referenceNo?: string;
}) {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem('sn_cash_out_v3');
    const list = saved ? JSON.parse(saved) : [];
    const newRecord = {
      id: `OUT-${Date.now()}`,
      date: entry.date,
      category: entry.category,
      amount: entry.amount,
      sourceAccount: entry.sourceAccount,
      recipient: entry.recipient,
      notes: entry.notes,
      referenceNo: entry.referenceNo || '-',
      createdAt: new Date().toISOString()
    };
    list.unshift(newRecord);
    localStorage.setItem('sn_cash_out_v3', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('sn_accounting_updated'));
  } catch (err) {
    console.error('Failed recording cash out', err);
  }
}
