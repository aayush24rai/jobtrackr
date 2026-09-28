import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './AuthLayout.css'

// same video as the landing page background
const VIDEO_SRC = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4'
const HERO_QUERY = '(min-width: 1024px)'   // the hero panel is hidden below this

// true while the media query matches; used so phones never download the video
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return
    const onChange = e => setMatches(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

const LogoMark = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="#fff" aria-hidden="true">
    <rect x="2" y="3" width="8" height="26" rx="4"/><rect x="12" y="3" width="8" height="18" rx="4"/><rect x="22" y="3" width="8" height="10" rx="4"/>
  </svg>
)
const EyeIcon = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off ? (
      <>
        <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13 13 0 0 1-1.7 2.7"/>
        <path d="M6.6 6.6A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/>
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m2 2 20 20"/>
      </>
    ) : (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
      </>
    )}
  </svg>
)

const Brand = ({ className = '' }) => (
  <Link to="/" className={`au-brand ${className}`} aria-label="JobTrackr home">
    <LogoMark/><span>JobTrackr</span>
  </Link>
)

// Two-column shell shared by Login and Signup
export default function AuthLayout({ heroTitle, heroText, steps, title, subtitle, children }) {
  const showHero = useMediaQuery(HERO_QUERY)
  const [reducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

  return (
    <main className="au">
      <section className="au-hero">
        {showHero && (
          <video src={VIDEO_SRC} autoPlay={!reducedMotion} loop muted playsInline preload="metadata" aria-hidden="true"/>
        )}
        <div className="au-hero-inner">
          <div className="au-rise" style={{ '--d': '.2s' }}><Brand/></div>
          <div className="au-rise" style={{ '--d': '.35s' }}>
            <h2>{heroTitle}</h2>
            <p>{heroText}</p>
          </div>
          <div className="au-steps">
            {steps.map((s, i) => (
              <div className="au-rise" style={{ '--d': `${0.5 + i * 0.15}s` }} key={s.text}>
                <StepItem number={i + 1} text={s.text} active={s.active}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="au-form-col">
        <div className="au-form au-fade">
          <Brand className="au-mobile-brand"/>
          <div className="au-head">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}

export function StepItem({ number, text, active = false }) {
  return (
    <div className={`au-step${active ? ' active' : ''}`}>
      <span className="au-step-num">{number}</span>
      {text}
    </div>
  )
}

export function InputGroup({ label, help, ...inputProps }) {
  return (
    <div className="au-field">
      <label htmlFor={inputProps.id}>{label}</label>
      <input {...inputProps}/>
      {help && <span className="au-help">{help}</span>}
    </div>
  )
}

// Password input with a show/hide toggle
export function PasswordGroup({ label, help, ...inputProps }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="au-field">
      <label htmlFor={inputProps.id}>{label}</label>
      <div className="au-input-wrap">
        <input {...inputProps} type={visible ? 'text' : 'password'}/>
        <button
          type="button"
          className="au-eye"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <EyeIcon off={visible}/>
        </button>
      </div>
      {help && <span className="au-help">{help}</span>}
    </div>
  )
}
