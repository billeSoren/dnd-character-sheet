'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { MagicItem, rarityColor, rarityBorder } from './magic-item-types'

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact', 'Varies']
const ITEM_TYPES = [
  'Armor', 'Potion', 'Ring', 'Rod', 'Scroll',
  'Staff', 'Wand', 'Weapon', 'Wondrous item',
]
const PAGE_SIZE = 30

interface Props {
  /** When provided, shows an "Add" button on each item card */
  onAdd?: (item: MagicItem) => Promise<void>
}

export default function MagicItemBrowser({ onAdd }: Props) {
  const supabase = createClient()

  const [items, setItems]           = useState<MagicItem[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [rarity, setRarity]         = useState('')
  const [type, setType]             = useState('')
  const [attunement, setAttunement] = useState<'' | 'yes' | 'no'>('')
  const [page, setPage]             = useState(0)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [adding, setAdding]         = useState<string | null>(null)
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchItems = useCallback(async (
    q: string, r: string, t: string, att: string, p: number,
  ) => {
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('magic_items')
      .select('id, name, type, rarity, requires_attunement, source, description', { count: 'exact' })
      .or('hidden.is.null,hidden.eq.false')
      .order('name')
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1)

    if (q.trim())       query = query.ilike('name', `%${q.trim()}%`)
    if (r)              query = query.ilike('rarity', r)
    if (t)              query = query.ilike('type', `%${t}%`)
    if (att === 'yes')  query = query.eq('requires_attunement', true)
    if (att === 'no')   query = query.or('requires_attunement.is.null,requires_attunement.eq.false')

    const { data, count, error } = await query
    if (!error) {
      const rows = (data ?? []) as MagicItem[]
      setItems((prev) => p === 0 ? rows : [...prev, ...rows])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [supabase])

  // Fetch on filter change; debounce text search only
  useEffect(() => {
    setPage(0)
    setItems([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const delay = search ? 300 : 0
    debounceRef.current = setTimeout(() => fetchItems(search, rarity, type, attunement, 0), delay)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, rarity, type, attunement, fetchItems])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchItems(search, rarity, type, attunement, next)
  }

  const handleAdd = async (e: React.MouseEvent, item: MagicItem) => {
    e.stopPropagation()
    if (!onAdd || adding) return
    setAdding(item.id)
    await onAdd(item)
    setAdding(null)
  }

  const toggleExpand = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id))

  return (
    <div className="space-y-3">
      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items…"
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white placeholder:text-gray-500 outline-none focus:border-dnd-accent transition-colors"
        />
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white outline-none focus:border-dnd-accent transition-colors"
        >
          <option value="">All Rarities</option>
          {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white outline-none focus:border-dnd-accent transition-colors"
        >
          <option value="">All Types</option>
          {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={attunement}
          onChange={(e) => setAttunement(e.target.value as '' | 'yes' | 'no')}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white outline-none focus:border-dnd-accent transition-colors"
        >
          <option value="">Attunement: Any</option>
          <option value="yes">Required</option>
          <option value="no">Not Required</option>
        </select>
      </div>

      {/* ── Result count ── */}
      <p className="text-xs text-dnd-muted px-0.5">
        {loading && items.length === 0
          ? 'Loading…'
          : `${total.toLocaleString()} item${total !== 1 ? 's' : ''}`}
      </p>

      {/* ── Item list ── */}
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => toggleExpand(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors hover:bg-white/5 ${
                rarityBorder(item.rarity)
              } bg-gray-800`}
            >
              {/* Rarity dot */}
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${rarityColor(item.rarity).replace('text-', 'bg-')}`} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dnd-text truncate">{item.name}</p>
                <p className="text-xs text-dnd-muted">
                  {item.type ?? 'Unknown type'}
                  {' · '}
                  <span className={rarityColor(item.rarity)}>{item.rarity ?? 'Unknown'}</span>
                  {item.requires_attunement && (
                    <span className="ml-1.5 text-dnd-accent/70">✦</span>
                  )}
                </p>
              </div>

              {item.source && (
                <span className="text-[10px] text-dnd-muted font-mono flex-shrink-0 hidden sm:block">
                  {item.source}
                </span>
              )}

              {onAdd && (
                <button
                  type="button"
                  onClick={(e) => handleAdd(e, item)}
                  disabled={!!adding}
                  className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold bg-dnd-accent/15 hover:bg-dnd-accent/30 text-dnd-accent rounded border border-dnd-accent/30 transition-colors disabled:opacity-50"
                >
                  {adding === item.id ? '…' : '+ Add'}
                </button>
              )}

              <svg
                className={`w-4 h-4 text-dnd-muted flex-shrink-0 transition-transform ${
                  expanded === item.id ? 'rotate-180' : ''
                }`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded description */}
            {expanded === item.id && (
              <div className="mx-1 px-4 py-3 border border-t-0 border-gray-700 rounded-b-lg bg-gray-900">
                <p className="text-xs text-dnd-text leading-relaxed whitespace-pre-wrap">
                  {item.description ?? 'No description available.'}
                </p>
                {item.requires_attunement && (
                  <p className="text-xs text-dnd-accent mt-2 font-medium">
                    ✦ Requires attunement
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {!loading && items.length === 0 && (
          <p className="text-center py-10 text-dnd-muted text-sm">No items found.</p>
        )}
      </div>

      {/* ── Load more ── */}
      {items.length < total && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="w-full py-2.5 border border-dnd-border rounded-lg text-sm text-dnd-muted hover:text-dnd-text hover:border-dnd-accent/30 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading…' : `Load more (${(total - items.length).toLocaleString()} remaining)`}
        </button>
      )}
    </div>
  )
}
