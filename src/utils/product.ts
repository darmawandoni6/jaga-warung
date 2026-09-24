/**
 * Generates an alias of maximum 2 characters from a product name.
 * Examples:
 * - "Indomie Goreng" -> "IG"
 * - "Aqua" -> "AQ"
 * - "Teh Botol Sosro" -> "TB"
 */
export function getProductAlias(name: string): string {
  if (!name) return '??';
  const clean = name.trim();
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return clean.slice(0, 2).toUpperCase();
}
