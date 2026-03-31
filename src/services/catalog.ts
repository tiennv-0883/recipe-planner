import type { CatalogEntry } from '@/src/types'

/**
 * Looks up a catalog entry by ingredient name (case-insensitive, trimmed).
 * Returns the first match, or undefined if none found.
 */
export function lookupByName(itemName: string, entries: CatalogEntry[]): CatalogEntry | undefined {
  const normalised = itemName.trim().toLowerCase()
  return entries.find((e) => e.name.trim().toLowerCase() === normalised)
}

/**
 * Returns entries sorted A–Z by name (locale-aware, case-insensitive).
 */
export function sortByName(entries: CatalogEntry[]): CatalogEntry[] {
  return [...entries].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  )
}
