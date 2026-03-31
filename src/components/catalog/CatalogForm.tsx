'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { CatalogEntry, StoreType } from '@/src/types'

interface CatalogFormProps {
  initial?: CatalogEntry
  onSave: (data: Omit<CatalogEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

const STORE_TYPES: StoreType[] = ['fresh', 'frozen', 'dry', 'canned', 'other']

export default function CatalogForm({ initial, onSave, onCancel }: CatalogFormProps) {
  const t = useTranslations('ingredientCatalog.form')
  const tTypes = useTranslations('storeTypes')

  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : '')
  const [unit, setUnit] = useState(initial?.unit ?? '')
  const [storeName, setStoreName] = useState(initial?.storeName ?? '')
  const [storeType, setStoreType] = useState<StoreType | ''>(initial?.storeType ?? '')
  const [sellerPhone, setSellerPhone] = useState(initial?.sellerPhone ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [nameError, setNameError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError(t('nameRequired'))
      return
    }
    setNameError('')
    onSave({
      name: trimmed,
      price: price !== '' ? Number(price) : undefined,
      unit: unit.trim() || undefined,
      storeName: storeName.trim() || undefined,
      storeType: storeType || undefined,
      sellerPhone: sellerPhone.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? t('titleEdit') : t('titleAdd')}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('cancel')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
            </div>

            {/* Price + Unit row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('price')}</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('unit')}</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder={t('unitPlaceholder')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Store name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('storeName')}</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={t('storeNamePlaceholder')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Store type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('storeType')}</label>
              <select
                value={storeType}
                onChange={(e) => setStoreType(e.target.value as StoreType | '')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">—</option>
                {STORE_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {tTypes(st)}
                  </option>
                ))}
              </select>
            </div>

            {/* Seller phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('sellerPhone')}</label>
              <input
                type="text"
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
