interface StatCardProps {
  number: string
  label: string
}

export function StatCard({ number, label }: StatCardProps): JSX.Element {
  return (
    <div className="landing-stat">
      <span className="landing-stat-number">{number}</span>
      <span className="landing-stat-label">{label}</span>
    </div>
  )
}
