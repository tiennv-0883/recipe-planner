'use client'

import { useTranslations } from 'next-intl'

interface CatalogEmptyStateProps {
  isFiltered?: boolean
  onAdd?: () => void
}

export default function CatalogEmptyState({ isFiltered = false, onAdd }: CatalogEmptyStateProps) {
  const t = useTranslations('ingredientCatalog')

  return (
    <div className="py-16 text-center">
      <svg
        className="w-12 h-12 mx-auto mb-4 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>

      {isFiltered ? (
        <p className="text-sm text-gray-500">{t('noResults')}</p>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-600 mb-1">{t('empty.title')}</p>
          {onAdd && (
            <button
              onClick={onAdd}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t('empty.cta')}
            </button>
          )}
        </>
      )}
    </div>
  )
}
