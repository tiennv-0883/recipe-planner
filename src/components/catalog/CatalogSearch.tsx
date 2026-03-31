'use client'

import { useTranslations } from 'next-intl'
import type { StoreType } from '@/src/types'

const STORE_TYPES: StoreType[] = ['fresh', 'frozen', 'dry', 'canned', 'other']

interface CatalogSearchProps {
  query: string
  storeType: StoreType | ''
  isFiltered: boolean
  onSearch: (q: string) => void
  onFilter: (type: StoreType | '') => void
  onClear: () => void
}

export default function CatalogSearch({
  query,
  storeType,
  isFiltered,
  onSearch,
  onFilter,
  onClear,
}: CatalogSearchProps) {
  const t = useTranslations('ingredientCatalog')
  const tTypes = useTranslations('storeTypes')

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Search input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Store type filter */}
      <select
        value={storeType}
        onChange={(e) => onFilter(e.target.value as StoreType | '')}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:w-44"
      >
        <option value="">{tTypes('all')}</option>
        {STORE_TYPES.map((st) => (
          <option key={st} value={st}>
            {tTypes(st)}
          </option>
        ))}
      </select>

      {/* Clear filter button */}
      {isFiltered && (
        <button
          onClick={onClear}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          {t('clearFilter')}
        </button>
      )}
    </div>
  )
}
