/**
 * Slugifie une chaîne de caractères.
 * @param s Chaîne à slugifier
 * @returns Chaîne slugifiée
 */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Convertit de manière sécurisée une valeur en string JSON pour PostgreSQL.
 * Gère les cas undefined, null, string, objets et arrays.
 *
 * @param value - Valeur à convertir en JSON
 * @param defaultValue - Valeur par défaut si value est undefined/null/empty (par défaut: null)
 * @returns String JSON ou null
 */
export const safeJsonStringify = (
  value: unknown,
  defaultValue: unknown = null
): string | null => {
  if (value === undefined || value === null || value === '') {
    return defaultValue === null ? null : JSON.stringify(defaultValue)
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length > 0 ? JSON.stringify(value) : JSON.stringify([])
    }
    return Object.keys(value).length > 0 ? JSON.stringify(value) : JSON.stringify({})
  }
  return JSON.stringify(value)
}
