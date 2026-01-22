interface StepCardProps {
  iconSrc: string
  iconAlt: string
  heading: string
  body: string
}

export function StepCard({ iconSrc, iconAlt, heading, body }: StepCardProps): JSX.Element {
  return (
    <div className="landing-step">
      <div className="landing-step-icon">
        <img
          src={iconSrc}
          alt={iconAlt}
          width={64}
          height={64}
          className="landing-step-icon-img"
        />
      </div>
      <div className="landing-step-content">
        <h3 className="landing-step-heading">{heading}</h3>
        <p className="landing-step-body">{body}</p>
      </div>
    </div>
  )
}
