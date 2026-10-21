import { Product } from '../types';

export interface SmartSearchResult {
  allRankedProducts: Product[];
  didYouMean: string | null;
  suggestedKeywords: string[];
  totalMatches: number;
}

/**
 * Standard Levenshtein distance between two strings
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = [];
  for (let i = 0; i <= m; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase() ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return d[m][n];
}

/**
 * Common Indonesian / Japanese transliteration typo aliases
 */
const COMMON_TYPO_MAP: Record<string, string> = {
  indomi: 'Indomie',
  indomiy: 'Indomie',
  indome: 'Indomie',
  bangoo: 'Bango',
  bngoo: 'Bango',
  bango: 'Bango',
  kecapp: 'Kecap',
  kcap: 'Kecap',
  krupuk: 'Kerupuk',
  kerpuk: 'Kerupuk',
  sambel: 'Sambal',
  samba: 'Sambal',
  smbal: 'Sambal',
  roiko: 'Royco',
  royko: 'Royco',
  berass: 'Beras',
  bras: 'Beras',
  tehbotol: 'Teh Botol',
  popmi: 'Pop Mie',
  popmie: 'Pop Mie',
  sarimi: 'Sarimi',
  sarimy: 'Sarimi',
  sedap: 'Sedaap',
  sedapp: 'Sedaap',
  miee: 'Mie',
  miye: 'Mie',
  brambang: 'Bawang',
  baput: 'Bawang Putih',
  bamer: 'Bawang Merah'
};

/**
 * Extract clean unique vocabulary keywords from products list
 */
export function getProductVocabulary(products: Product[]): string[] {
  const wordsSet = new Set<string>();

  products.forEach((p) => {
    // Add brand
    if (p.brand && p.brand.trim()) {
      wordsSet.add(p.brand.trim());
    }

    // Add main words from product name
    const tokens = p.name
      .replace(/[()[\],.\-–—/0-9]/g, ' ')
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2);

    tokens.forEach((w) => wordsSet.add(w));

    // Add category parts
    if (p.category) {
      p.category.split(/[&,]/).forEach((c) => {
        const clean = c.trim();
        if (clean.length >= 2) wordsSet.add(clean);
      });
    }
  });

  return Array.from(wordsSet);
}

/**
 * Perform smart search with prefix ranking, typo tolerance, and keyword suggestions
 */
export function smartSearchProducts(
  rawQuery: string,
  products: Product[],
  options?: { maxResults?: number }
): SmartSearchResult {
  const query = rawQuery.trim().toLowerCase();
  const maxResults = options?.maxResults || 24;

  if (!query) {
    return {
      allRankedProducts: [],
      didYouMean: null,
      suggestedKeywords: [],
      totalMatches: 0
    };
  }

  const vocabulary = getProductVocabulary(products);

  // 1. Check for known typo aliases first
  let didYouMean: string | null = null;
  if (COMMON_TYPO_MAP[query]) {
    didYouMean = COMMON_TYPO_MAP[query];
  } else if (query.length >= 3) {
    // Check fuzzy match against vocabulary
    let bestDist = Infinity;
    let bestWord: string | null = null;
    const maxAllowedDist = query.length <= 4 ? 1 : 2;

    for (const word of vocabulary) {
      const lower = word.toLowerCase();
      if (lower === query) {
        bestWord = null;
        break;
      }
      const dist = levenshteinDistance(query, lower);
      if (dist <= maxAllowedDist && dist < bestDist) {
        bestDist = dist;
        bestWord = word;
      }
    }

    if (bestWord && bestWord.toLowerCase() !== query) {
      didYouMean = bestWord;
    }
  }

  // 2. Collect keyword suggestions that start with the query or letter (e.g. typing "A" shows words starting with A)
  const suggestedKeywords = vocabulary
    .filter((word) => {
      const lower = word.toLowerCase();
      return lower.startsWith(query) && lower !== query;
    })
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 8);

  // If didYouMean exists and not in suggestions, insert at the front
  if (didYouMean && !suggestedKeywords.some((k) => k.toLowerCase() === didYouMean?.toLowerCase())) {
    suggestedKeywords.unshift(didYouMean);
  }

  // 3. Multi-tier ranking of products
  const exactStarts: Product[] = [];
  const wordStarts: Product[] = [];
  const brandOrCatStarts: Product[] = [];
  const containsMatches: Product[] = [];
  const fuzzyMatches: Product[] = [];
  const seenIds = new Set<string>();

  const targetKeywords = [query];
  if (didYouMean) {
    targetKeywords.push(didYouMean.toLowerCase());
  }

  products.forEach((p) => {
    const nameLower = p.name.toLowerCase();
    const nameJpLower = p.nameJp?.toLowerCase() || '';
    const nameEnLower = p.nameEn?.toLowerCase() || '';
    const brandLower = p.brand?.toLowerCase() || '';
    const catLower = p.category?.toLowerCase() || '';
    const words = nameLower.split(/\s+/);

    // Tier 1: Product name strictly starts with the query letter/word
    // (e.g. user typed "A" -> product name starts with "a")
    if (nameLower.startsWith(query) || nameJpLower.startsWith(query) || nameEnLower.startsWith(query)) {
      exactStarts.push(p);
      seenIds.add(p.id);
      return;
    }

    // Tier 2: A word inside the product name starts with the query
    // (e.g. user typed "B" -> "Kecap Bango" where "Bango" starts with "b")
    if (words.some((w) => w.startsWith(query))) {
      wordStarts.push(p);
      seenIds.add(p.id);
      return;
    }

    // Tier 3: Brand or Category starts with query
    if (brandLower.startsWith(query) || catLower.startsWith(query)) {
      brandOrCatStarts.push(p);
      seenIds.add(p.id);
      return;
    }

    // Tier 4: Substring contains match
    if (
      nameLower.includes(query) ||
      nameJpLower.includes(query) ||
      nameEnLower.includes(query) ||
      brandLower.includes(query) ||
      catLower.includes(query)
    ) {
      containsMatches.push(p);
      seenIds.add(p.id);
      return;
    }

    // Tier 5: Fuzzy match (Typo tolerance)
    if (query.length >= 3) {
      const maxDist = query.length <= 4 ? 1 : 2;
      const hasFuzzyWord = words.some((w) => {
        // Compare with query or didYouMean
        if (levenshteinDistance(w, query) <= maxDist) return true;
        if (didYouMean && levenshteinDistance(w, didYouMean.toLowerCase()) <= maxDist) return true;
        return false;
      });

      const brandFuzzy = levenshteinDistance(brandLower, query) <= maxDist;

      if (hasFuzzyWord || brandFuzzy) {
        fuzzyMatches.push(p);
        seenIds.add(p.id);
        return;
      }
    }
  });

  // Sort each tier internally alphabetically or by rating/reviews
  const sortAlphabetical = (a: Product, b: Product) => a.name.localeCompare(b.name);

  exactStarts.sort(sortAlphabetical);
  wordStarts.sort(sortAlphabetical);
  brandOrCatStarts.sort(sortAlphabetical);
  containsMatches.sort(sortAlphabetical);
  fuzzyMatches.sort(sortAlphabetical);

  // Combine tiers in strict priority order
  const allRankedProducts = [
    ...exactStarts,
    ...wordStarts,
    ...brandOrCatStarts,
    ...containsMatches,
    ...fuzzyMatches
  ].slice(0, maxResults);

  return {
    allRankedProducts,
    didYouMean: didYouMean && allRankedProducts.length > 0 ? didYouMean : didYouMean,
    suggestedKeywords,
    totalMatches: seenIds.size
  };
}
