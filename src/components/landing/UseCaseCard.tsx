interface UseCaseCardProps {
  iconSrc: string
  iconAlt: string
  heading: string
  body: string
}

export function UseCaseCard({ iconSrc, iconAlt, heading, body }: UseCaseCardProps): JSX.Element {
  return (
    <div className="landing-use-case-card">
      <div className="landing-use-case-header">
        <div className="landing-use-case-icon">
          <img
            src={iconSrc}
            alt={iconAlt}
            width={64}
            height={64}
            className="landing-persona-icon-img"
          />
        </div>
        <h3 className="landing-use-case-heading">{heading}</h3>
      </div>
      <p className="landing-use-case-body">{body}</p>
    </div>
  )
}
