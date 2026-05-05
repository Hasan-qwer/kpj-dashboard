import type { CSSProperties } from 'react'

// Icon/badge gradient backgrounds — used via style prop (not Tailwind classes)
// This avoids Tailwind's content-scanning purge of dynamically-built class strings
export const G: Record<string, CSSProperties> = {
  blue:    { background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)' },
  purple:  { background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' },
  emerald: { background: 'linear-gradient(135deg, #34d399 0%, #0d9488 100%)' },
  amber:   { background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)' },
  rose:    { background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)' },
  cyan:    { background: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)' },
  green:   { background: 'linear-gradient(135deg, #4ade80 0%, #059669 100%)' },
  red:     { background: 'linear-gradient(135deg, #f87171 0%, #e11d48 100%)' },
  navy:    { background: 'linear-gradient(135deg, #002855 0%, #0057a8 100%)' },
  slate:   { background: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)' },
  orange:  { background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)' },
  teal:    { background: 'linear-gradient(135deg, #2dd4bf 0%, #0f766e 100%)' },
  pink:    { background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)' },
  violet:  { background: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)' },
  sky:     { background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' },
  indigo:  { background: 'linear-gradient(135deg, #818cf8 0%, #4338ca 100%)' },
  dark:    { background: 'linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #0f2548 70%, #112d5a 100%)' },
}

// Soft card backgrounds (very light tints for stat cards)
export const CARD_BG: Record<string, CSSProperties> = {
  blue:    { background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
  purple:  { background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' },
  emerald: { background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' },
  amber:   { background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' },
  rose:    { background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' },
  cyan:    { background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)' },
  green:   { background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' },
  red:     { background: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)' },
}

// Text colors that pair with CARD_BG
export const CARD_TEXT: Record<string, string> = {
  blue:    '#1d4ed8',
  purple:  '#6d28d9',
  emerald: '#065f46',
  amber:   '#b45309',
  rose:    '#be123c',
  cyan:    '#0e7490',
  green:   '#166534',
  red:     '#be123c',
}

export const CARD_SUB: Record<string, string> = {
  blue:    '#3b82f6',
  purple:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  cyan:    '#06b6d4',
  green:   '#22c55e',
  red:     '#ef4444',
}

export const CARD_BORDER: Record<string, string> = {
  blue:    '#bfdbfe',
  purple:  '#ddd6fe',
  emerald: '#a7f3d0',
  amber:   '#fde68a',
  rose:    '#fecdd3',
  cyan:    '#a5f3fc',
  green:   '#bbf7d0',
  red:     '#fecaca',
}
