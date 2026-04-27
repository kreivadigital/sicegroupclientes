/**
 * Devuelve true si la URL es un path interno seguro al que se puede
 * redirigir despues del login. Rechaza:
 *  - URLs absolutas (http://..., https://...)
 *  - URLs protocol-relative (//evil.com)
 *  - Paths con barra invertida (/\evil.com — algunos browsers lo interpretan como protocol-relative)
 *  - Strings vacios o null
 */
export function isSafeReturnUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /^\/(?![\/\\])/.test(url);
}
