interface FinalCtaItemProps {
  heading: string
  body: string
}

export function FinalCtaItem({ heading, body }: FinalCtaItemProps): JSX.Element {
  return (
    <div className="landing-final-cta-item">
      <h3 className="landing-final-cta-heading">{heading}</h3>
      <p className="landing-final-cta-body">{body}</p>
    </div>
  )
}
