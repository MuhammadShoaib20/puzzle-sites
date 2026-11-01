export const CANONICAL_SITE_URL = 'https://puzzlewalkthroughs.com';

export function canonicalUrl(path: string): string {
  const normalizedPath =
    path === '/'
      ? ''
      : `/${path.replace(/^\/+|\/+$/g, '').toLowerCase()}`;
  return `${CANONICAL_SITE_URL}${normalizedPath}`;
}
