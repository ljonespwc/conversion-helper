interface ComparisonColumnProps {
  header: string
  items: string[]
  variant: 'owners' | 'visitors'
}

export function ComparisonColumn({ header, items, variant }: ComparisonColumnProps): JSX.Element {
  const columnClass = variant === 'owners'
    ? 'landing-comparison-column landing-comparison-owners'
    : 'landing-comparison-column landing-comparison-visitors'

  return (
    <div className={columnClass}>
      <h3 className="landing-comparison-header">{header}</h3>
      <ul className="landing-comparison-list">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
