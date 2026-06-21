// Distinct hues that stay legible on both light and dark backgrounds.
const palette = [
  { match: 'tithe',      bg: 'rgba(56, 139, 253, 0.16)',  fg: '#4f93f7' },
  { match: 'offering',   bg: 'rgba(22, 185, 129, 0.16)',  fg: '#1cc98e' },
  { match: 'mission',    bg: 'rgba(245, 158, 11, 0.16)',  fg: '#f0a92b' },
  { match: 'conference', bg: 'rgba(168, 85, 247, 0.16)',  fg: '#b27cf3' },
  { match: 'electric',   bg: 'rgba(239, 68, 88, 0.16)',   fg: '#f56a78' },
]
const fallback = { bg: 'var(--accent-soft)', fg: 'var(--accent)' }

export default function Badge({ type }) {
  const key = String(type || '').toLowerCase()
  const c = palette.find(p => key.includes(p.match)) || fallback
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.fg }}>
      {type}
    </span>
  )
}
