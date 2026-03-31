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
 * GET /api/catalog
 * Returns all catalog entries for the authenticated user, sorted A–Z by name.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('catalog_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entries: (data ?? []).map(toEntry) })
}

/**
 * POST /api/catalog
 * Creates a new catalog entry. Body: { name (required), price?, unit?, storeName?, storeType?, sellerPhone?, notes? }
 */
export async function POST(req: NextRequest) {
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
    .insert({
      user_id: user.id,
      name,
      price,
      unit: (body.unit as string | undefined) ?? null,
      store_name: (body.storeName as string | undefined) ?? null,
      store_type: storeType ?? null,
      seller_phone: (body.sellerPhone as string | undefined) ?? null,
      notes: (body.notes as string | undefined) ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entry: toEntry(data) }, { status: 201 })
}
