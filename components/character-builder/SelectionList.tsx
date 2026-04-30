'use client'

import { useState } from 'react'

export interface SelectionItem {
  name: string
  source: string
  icon?: string
  shortDesc: string
  details?: { label: string; value: string }[]
}

interface SelectionListProps {
  items: SelectionItem[]
  selected: string
  onSelect: (name: string) => void
  placeholder?: string
}

export default function SelectionList({ items, selected, onSelect, placeholder = 'Search…' }: SelectionListProps) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(selected || null)

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleRowClick = (name: string) => {
    onSelect(name)
    setExpanded((prev) => (prev === name ? null : name))
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-3 w-4 h-4 text-dnd-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-dnd-subtle border border-dnd-border rounded-lg text-dnd-text placeholder:text-dnd-muted outline-none focus:border-dnd-accent transition-colors text-sm"
        />
      </div>

      {/* List */}
      <div className="border border-dnd-border rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-dnd-muted text-sm">
            No results for &ldquo;{search}&rdquo;
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isSelected = selected === item.name
            const isExpanded = expanded === item.name

            return (
              <div key={item.name} className={idx > 0 ? 'border-t border-dnd-border' : ''}>
                <button
                  onClick={() => handleRowClick(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                    isSelected
                      ? 'bg-dnd-accent/10 border-l-[3px] border-l-dnd-accent'
                      : 'bg-dnd-card hover:bg-dnd-subtle border-l-[3px] border-l-transparent'
                  }`}
                >
                  {item.icon && (
                    <span className="text-xl flex-shrink-0 w-8 text-center leading-none">{item.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm tracking-wider uppercase ${isSelected ? 'text-dnd-accent' : 'text-dnd-text'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-dnd-muted mt-0.5">{item.source}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-dnd-muted flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 pt-3 bg-dnd-subtle border-l-[3px] border-l-dnd-accent">
                    <p className="text-sm text-dnd-muted leading-relaxed mb-3">{item.shortDesc}</p>
                    {item.details && item.details.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.details.map((d) => (
                          <span
                            key={d.label}
                            className="inline-flex gap-1 text-xs bg-dnd-card border border-dnd-border rounded px-2.5 py-1"
                          >
                            <span className="text-dnd-muted">{d.label}:</span>
                            <span className="text-dnd-text font-semibold">{d.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
