export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-surface-2 rounded-2xl p-3.5 border border-line">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`text-base font-semibold ${accent ? 'text-accent' : 'text-content'}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  )
}
