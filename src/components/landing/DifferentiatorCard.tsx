import type { ReactNode } from 'react'

interface DifferentiatorCardProps {
  heading: string
  subhead: string
  features: ReactNode[]
  image?: {
    src: string
    alt: string
    width: number
    height: number
    caption: string
  }
  reverse?: boolean
  textOnly?: boolean
  children?: ReactNode
}

export function DifferentiatorCard({
  heading,
  subhead,
  features,
  image,
  reverse = false,
  textOnly = false,
  children,
}: DifferentiatorCardProps): JSX.Element {
  if (textOnly) {
    return (
      <div className="differentiator-card">
        <div className="landing-differentiator landing-differentiator-text-only">
          <div className="landing-differentiator-content-full">
            <h3 className="landing-differentiator-heading">{heading}</h3>
            <p className="landing-differentiator-subhead">{subhead}</p>
            <ul className="landing-sub-diff-list">
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            {children}
          </div>
        </div>
      </div>
    )
  }

  const layoutClass = reverse
    ? 'landing-differentiator landing-differentiator-reverse'
    : 'landing-differentiator'

  return (
    <div className="differentiator-card">
      <div className={layoutClass}>
        <div className="landing-differentiator-content">
          <h3 className="landing-differentiator-heading">{heading}</h3>
          <p className="landing-differentiator-subhead">{subhead}</p>
          <ul className="landing-sub-diff-list">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        {image && (
          <div className="landing-differentiator-image">
            <div className="landing-image-wrapper-small">
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="landing-differentiator-img"
              />
              <p className="landing-image-caption">{image.caption}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
