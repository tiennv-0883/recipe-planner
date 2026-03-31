'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import MainLayout from '@/src/components/layout/MainLayout'
import CatalogList from '@/src/components/catalog/CatalogList'
import CatalogForm from '@/src/components/catalog/CatalogForm'
import CatalogSearch from '@/src/components/catalog/CatalogSearch'
import { useCatalog } from '@/src/context/CatalogContext'
import { sortByName } from '@/src/services/catalog'
import type { CatalogEntry, StoreType } from '@/src/types'

export default function IngredientCatalogPage() {
  const t = useTranslations('ingredientCatalog')
  const { state, apiDispatch } = useCatalog()

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CatalogEntry | undefined>()

  // Search / filter state (US2)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStoreType, setFilterStoreType] = useState<StoreType | ''>('')

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery])

  const filtered = useMemo(() => {
    let result = sortByName(state.entries)
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase()
      result = result.filter((e) => e.name.toLowerCase().includes(q))
    }
    if (filterStoreType) {
      result = result.filter((e) => e.storeType === filterStoreType)
    }
    return result
  }, [state.entries, debouncedQuery, filterStoreType])

  const isFiltered = debouncedQuery.trim() !== '' || filterStoreType !== ''

  function openAdd() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  function openEdit(entry: CatalogEntry) {
    setEditTarget(entry)
    setFormOpen(true)
  }

  function handleSave(data: Omit<CatalogEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    if (editTarget) {
      apiDispatch({ type: 'UPDATE_ENTRY', payload: { ...editTarget, ...data } })
    } else {
      apiDispatch({
        type: 'ADD_ENTRY',
        payload: { id: '', userId: '', createdAt: '', updatedAt: '', ...data },
      })
    }
    setFormOpen(false)
  }

  function handleDelete(id: string) {
    apiDispatch({ type: 'DELETE_ENTRY', payload: { id } })
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('addButton')}
          </button>
        </div>

        {/* Error banner */}
        {state.error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Search + filter (US2) */}
        <div className="mb-4">
          <CatalogSearch
            query={searchQuery}
            storeType={filterStoreType}
            onSearch={setSearchQuery}
            onFilter={setFilterStoreType}
            onClear={() => { setSearchQuery(''); setFilterStoreType('') }}
            isFiltered={isFiltered}
          />
        </div>

        {/* List */}
        <CatalogList
          entries={filtered}
          isFiltered={isFiltered}
          loading={state.loading}
          onEdit={openEdit}
          onDelete={handleDelete}
          onAdd={openAdd}
        />
      </div>

      {/* Form modal */}
      {formOpen && (
        <CatalogForm
          initial={editTarget}
          onSave={handleSave}
          onCancel={() => setFormOpen(false)}
        />
      )}
    </MainLayout>
  )
}
