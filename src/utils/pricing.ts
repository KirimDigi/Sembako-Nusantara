import { Product } from '../types';

export interface BulkPriceTier {
  minQty: number;
  maxQty?: number;
  label: string;
  price: number;
  priceTax: number;
}

export function parseMinQty(val: number | string | undefined, defaultMin: number): number {
  if (val === undefined || val === null) return defaultMin;
  if (typeof val === 'number') return val;
  const match = String(val).match(/\d+/);
  return match ? parseInt(match[0], 10) : defaultMin;
}

export function getBulkPriceTiers(product: Product): BulkPriceTier[] {
  if (!product.bulkPrices) return [];
  const { tier1_qty, tier1_price, tier2_qty, tier2_price, tier3_qty, tier3_price } = product.bulkPrices;
  const tiers: BulkPriceTier[] = [];

  const q1 = parseMinQty(tier1_qty, 6);
  const q2 = parseMinQty(tier2_qty, 12);
  const q3 = parseMinQty(tier3_qty, 24);

  if (tier1_price) {
    tiers.push({
      minQty: q1,
      maxQty: q2 - 1,
      label: `Bulk ${q1}–${q2 - 1}`,
      price: tier1_price,
      priceTax: Math.round(tier1_price * 1.08)
    });
  }
  if (tier2_price) {
    tiers.push({
      minQty: q2,
      maxQty: q3 - 1,
      label: `Bulk ${q2}–${q3 - 1}`,
      price: tier2_price,
      priceTax: Math.round(tier2_price * 1.08)
    });
  }
  if (tier3_price) {
    tiers.push({
      minQty: q3,
      label: `Bulk 1 Dus (${q3}+)`,
      price: tier3_price,
      priceTax: Math.round(tier3_price * 1.08)
    });
  }
  return tiers;
}

export function getEffectiveUnitPrice(
  product: Product,
  quantity: number = 1
): { price: number; priceTax: number; isBulk: boolean; tierLabel?: string; savingsPercent?: number } {
  if (product.bulkPrices && quantity > 1) {
    const { tier1_qty, tier1_price, tier2_qty, tier2_price, tier3_qty, tier3_price } = product.bulkPrices;
    const q1 = parseMinQty(tier1_qty, 6);
    const q2 = parseMinQty(tier2_qty, 12);
    const q3 = parseMinQty(tier3_qty, 24);

    if (quantity >= q3 && tier3_price) {
      const savings = Math.max(0, Math.round(((product.price - tier3_price) / product.price) * 100));
      return {
        price: tier3_price,
        priceTax: Math.round(tier3_price * 1.08),
        isBulk: true,
        tierLabel: `1 Dus (${q3}+)`,
        savingsPercent: savings
      };
    }
    if (quantity >= q2 && tier2_price) {
      const savings = Math.max(0, Math.round(((product.price - tier2_price) / product.price) * 100));
      return {
        price: tier2_price,
        priceTax: Math.round(tier2_price * 1.08),
        isBulk: true,
        tierLabel: `Bulk ${q2}+`,
        savingsPercent: savings
      };
    }
    if (quantity >= q1 && tier1_price) {
      const savings = Math.max(0, Math.round(((product.price - tier1_price) / product.price) * 100));
      return {
        price: tier1_price,
        priceTax: Math.round(tier1_price * 1.08),
        isBulk: true,
        tierLabel: `Bulk ${q1}+`,
        savingsPercent: savings
      };
    }
  }
  return { price: product.price, priceTax: product.priceTax, isBulk: false };
}
