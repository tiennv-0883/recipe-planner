import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import type { CatalogEntry, StoreType } from '@/src/types'

const VALID_STORE_TYPES: StoreType[] = ['fresh', 'frozen', 'dry', 'canned', 'other']

function toEntry(row: Record<string, unknown>): CatalogEntry {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    price: row.price != null ? Number(row.price) : undefined,
    unit: (row.unit as string | null) ?? undefined,
    storeName: (row.store_name as string | null) ?? undefined,
    storeType: (row.store_type as StoreType | null) ?? undefined,
    sellerPhone: (row.seller_phone as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

/**
 * PUT /api/catalog/[id]
 * Updates a catalog entry. RLS ensures only the owner can modify it.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const storeType = body.storeType as string | undefined
  if (storeType && !VALID_STORE_TYPES.includes(storeType as StoreType)) {
    return NextResponse.json({ error: 'Invalid storeType' }, { status: 400 })
  }

  const price = body.price != null ? Number(body.price) : null
  if (price !== null && (isNaN(price) || price < 0)) {
    return NextResponse.json({ error: 'price must be a non-negative number' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('catalog_entries')
    .update({
      name,
      price,
      unit: (body.unit as string | undefined) ?? null,
      store_name: (body.storeName as string | undefined) ?? null,
      store_type: storeType ?? null,
      seller_phone: (body.sellerPhone as string | undefined) ?? null,
      notes: (body.notes as string | undefined) ?? null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entry: toEntry(data) })
}

/**
 * DELETE /api/catalog/[id]
 * Hard-deletes a catalog entry. RLS ensures only the owner can delete it.
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error, count } = await supabase
    .from('catalog_entries')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
