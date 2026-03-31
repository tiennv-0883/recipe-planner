'use client'

import type { CatalogEntry } from '@/src/types'
import CatalogCard from './CatalogCard'
import CatalogEmptyState from './CatalogEmptyState'

interface CatalogListProps {
  entries: CatalogEntry[]
  isFiltered?: boolean
  loading?: boolean
  onEdit: (entry: CatalogEntry) => void
  onDelete: (id: string) => void
  onAdd?: () => void
}

export default function CatalogList({
  entries,
  isFiltered = false,
  loading = false,
  onEdit,
  onDelete,
  onAdd,
}: CatalogListProps) {
  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return <CatalogEmptyState isFiltered={isFiltered} onAdd={onAdd} />
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.id}>
          <CatalogCard entry={entry} onEdit={onEdit} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  )
}
