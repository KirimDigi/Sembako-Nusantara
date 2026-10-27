/**
 * Helper to resolve public assets correctly in all environments
 * (Localhost, GitHub Pages subfolder, custom domain, etc.)
 */
export function assetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  let cleanPath = path;
  while (cleanPath.startsWith('./')) {
    cleanPath = cleanPath.slice(2);
  }
  while (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${cleanPath}`;
}
